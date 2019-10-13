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
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate the name
            var nameResult = validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                alert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?
            
            //create the model command
            let createCommandData = {};
            createCommandData.type = "addComponent";
            createCommandData.parentFullName = userInputProperties.parentName;
            createCommandData.memberJson = Component.createMemberJson(componentGenerator,userInputProperties,optionalBaseMemberValues);
            createCommandData.componentJson = Component.createComponentJson(componentGenerator,userInputProperties,optionalBaseComponentValues);

            //editor related commands
            let parentComponent = getComponentFromName(workspaceUI,userInputProperties.parentName);
            let additionalCommands = getAdditionalCommands(parentComponent,userInputProperties.name);

            let commandData = {};
            commandData.type = "compoundCommand";
            commandData.childCommands = [];
            //any needed delete commands
            if(additionalCommands.deletedComponentCommands) {

                let deletedComponentNames = additionalCommands.deletedComponentCommands.map(command => command.memberFullName);

                let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + deletedComponentNames);
                //do not do delete.
                if(!doDelete) return;

                for(var i = 0; i < additionalCommands.deletedComponentCommands.length; i++) {
                    commandData.childCommands.push(additionalCommands.deletedComponentCommands[i]);
                }
            }
            //the create component command
            commandData.childCommands.push(createCommandData);
            //the insert node commands
            commandData.childCommands.push(additionalCommands.editorCommand);

            
            //execute command
            workspaceUI.getApp().executeCommand(commandData);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        showConfigurableDialog(dialogLayout,onSubmitFunction);
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

    let fullName = parentComponent.getMember().getChildFullName(childName);

    //check selection
    let useParentSelection = getUseParentSelection(parentComponent);
    
    let insertAtEnd = !useParentSelection;
    return parentComponent.getInsertApogeeNodeOnPageCommands(fullName,insertAtEnd);
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
