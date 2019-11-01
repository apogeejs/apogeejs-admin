import util from "/apogeeutil/util.js";
import {validateTableName} from "/apogee/lib/codeCompiler.js"; 

import {getPropertiesDialogLayout} from "/apogeeapp/app/commandseq/updatecomponentseq.js";
import Component from "/apogeeapp/app/component/Component.js";
import {showConfigurableDialog} from "/apogeeapp/app/dialogs/ConfigurableDialog.js";
import {showSelectComponentDialog} from "/apogeeapp/app/dialogs/SelectControlDialog.js";

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset. The created componenent will also use the 
 * property values in optionalBaseComponentValues, overridden by the user input properties where applicable. The member
 * created will be made using the optionalBaseMemberValues, agagin overidden by any user input values.  */   
//piggybackCommand is a temporary test!!!
export function addComponent(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {

        //get the active workspace
        var workspaceUI = app.getWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }     
        
        //get the tyep display name
        var displayName = componentGenerator.displayName
        
        //get any additional property content for dialog beyond basic properties
        var additionalLines = util.jsonCopy(componentGenerator.propertyDialogLines); 
        
        //get the folder list
        var folderList = workspaceUI.getFolders();
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = getPropertiesDialogLayout(displayName,folderList,additionalLines,true,optionalInitialProperties);

        //we will populate the parent if we need to insert thenew component as a child in the parent document. 
        
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate the name
            var nameResult = validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?

            let commands = [];
            
            //create the model command
            let createCommandData = {};
            createCommandData.type = "addComponent";
            createCommandData.parentFullName = userInputProperties.parentName;
            createCommandData.memberJson = Component.createMemberJson(componentGenerator,userInputProperties,optionalBaseMemberValues);
            createCommandData.componentJson = Component.createComponentJson(componentGenerator,userInputProperties,optionalBaseComponentValues);

            //editor related commands
            let additionalCommands;
            let parentComponent;
            if(componentGenerator.hasChildEntry) {
                parentComponent = getComponentFromName(workspaceUI,userInputProperties.parentName);
                additionalCommands = getAdditionalCommands(parentComponent,userInputProperties.name);

                //added the editor setup command
                if(additionalCommands.editorSetupCommand) commands.push(additionalCommands.editorSetupCommand);

                //add any delete commands
                if(additionalCommands.deletedComponentCommands){
                    //make sure the user wants to proceed
                    let deletedComponentNames = additionalCommands.deletedComponentCommands.map(command => command.memberFullName);
                    let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + deletedComponentNames);
                    
                    //return if user rejects
                    if(!doDelete) return;

                    commands.push(...additionalCommands.deletedComponentCommands);
                } 
            }

            //store create command
            commands.push(createCommandData);

            //add the editor insert command
            if((additionalCommands)&&(additionalCommands.editorAddCommand)) {
                commands.push(additionalCommands.editorAddCommand);
            }
            
            let commandData;
            if(commands.length > 1) {
                commandData = {};
                commandData.type = "compoundCommand";
                commandData.childCommands = commands;
            }
            else if(commands.length === 1) {
                commandData = commands[0];
            }
            else {
                //this shouldn't happen
                return;
            }
            
            //execute command
            workspaceUI.getApp().executeCommand(commandData);

            //give focus back to editor
            if(componentGenerator.hasChildEntry) {
                parentComponent.giveEditorFocusIfShowing();
            }

            //return true to close the dialog
            return true;
        }

        //give foxus back to editor
        let onCancelFunction = () => null; /*parentComponent.giveEditorFocusIfShowing() - oops no parent component*/;
        
        //show dialog
        showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}


/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
//piggybackCommand is a temporary test!!!
export function addAdditionalComponent(app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {
        
    var onSelect = function(componentType) {
        var componentGenerator = app.getComponentGenerator(componentType);
        if(componentGenerator) {
            addComponent(app,componentGenerator,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
        }
        else {
            alert("Unknown component type: " + componentType);
        }
    }
    //get the display names
    var componentNames = app.additionalComponents.map(componentClassName => {
        var generator = app.getComponentGenerator(componentClassName);
        if(generator) {
            return generator.displayName;
        }
        else {
            return componentClassName + " (ERROR - not found!)";
        }
    })
    //open select component dialog
    showSelectComponentDialog(componentNames,app.additionalComponents,onSelect);
}

function getAdditionalCommands(parentComponent,childName) {

    //check selection
    let useParentSelection = getUseParentSelection(parentComponent);
    
    let insertAtEnd = !useParentSelection;

    return parentComponent.getInsertApogeeNodeOnPageCommands(childName,insertAtEnd);
}

function getComponentFromName(workspaceUI, componentName) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(componentName);
    var component = workspaceUI.getComponent(member);
    return component;
}

function getUseParentSelection(parentComponent) {
    //use the parent selection only if the tab is the active tab
    //otherwise the component should be placed at the end

    let tabDisplay = parentComponent.getTabDisplay();
    if(!tabDisplay) return false;

    let tab = tabDisplay.getTab();
    if(!tab) return false;
    
    return tabDisplay.getIsShowing();
}
