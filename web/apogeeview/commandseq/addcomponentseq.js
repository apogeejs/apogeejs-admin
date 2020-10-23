import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {validateTableName} from "/apogee/apogeeCoreLib.js"; 

import {getPropertiesDialogLayout} from "/apogeeview/commandseq/updatecomponentseq.js";
import {Component,componentInfo} from "/apogeeapp/apogeeAppLib.js";
import {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";
import {showSelectComponentDialog} from "/apogeeview/dialogs/SelectControlDialog.js";
import {showSimpleActionDialog} from "/apogeeview/dialogs/SimpleActionDialog.js";
import {getComponentViewClass} from "/apogeeview/componentViewInfo.js";

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset. The created componenent will also use the 
 * property values in optionalBaseComponentValues, overridden by the user input properties where applicable. The member
 * created will be made using the optionalBaseMemberValues, agagin overidden by any user input values.  */   
//piggybackCommand is a temporary test!!!
export function addComponent(appView,app,componentClass,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {

        let componentViewClass = getComponentViewClass(componentClass.uniqueName);
        let modelView = appView.getWorkspaceView().getModelView();

        //get the active workspace
        var workspaceManager = app.getWorkspaceManager();
        if(!workspaceManager) {
            apogeeUserAlert("There is no open workspace.");
            return;
        }     

        var modelManager = workspaceManager.getModelManager();
        if(!modelManager) {
            apogeeUserAlert("The workspace has not been loaded yet.");
            return;
        }    

        //this is not a true test - the workspace and model can be presenet ith out the model loaded.

        
        //get the tyep display name
        var displayName = componentClass.displayName
        
        //get any additional property content for dialog beyond basic properties
        var additionalLines = apogeeutil.jsonCopy(componentViewClass.propertyDialogLines); 
        
        //get the folder list
        let includeRootFolder = componentViewClass.hasTabEntry;
        var parentList = modelManager.getParentList(includeRootFolder);
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = getPropertiesDialogLayout(displayName,parentList,additionalLines,true,optionalInitialProperties);

        //we will populate the parent if we need to insert thenew component as a child in the parent document. 
        
        
        //create on submit callback
        var onSubmitFunction = function(userInputProperties) {
            
            //validate the name
            var nameResult = validateTableName(userInputProperties.name);
            if(!nameResult.valid) {
                apogeeUserAlert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?

//we should do this cleaner - by storing parent id in the submit input
            let modelManager = modelView.getModelManager();
            let parentMemberId = userInputProperties.parentId;

            let commandsDeleteComponent = false;
            let deleteMsg;
            let commands = [];
            
            //create the model command
            let createCommandData = {};
            createCommandData.type = "addComponent";
            createCommandData.parentId = parentMemberId;
            createCommandData.memberJson = Component.createMemberJson(componentClass,userInputProperties,optionalBaseMemberValues);
            createCommandData.componentJson = Component.createComponentJson(componentClass,userInputProperties,optionalBaseComponentValues);

            //editor related commands
            let additionalCommandInfo;
            let parentComponentView;
            if(componentViewClass.hasChildEntry) {
                let parentComponentId = modelManager.getComponentIdByMemberId(parentMemberId);
                if(parentComponentId) {
                    parentComponentView = modelView.getComponentViewByComponentId(parentComponentId);
                    if(!parentComponentView) throw new Error("Parent component not found!");

                    additionalCommandInfo = getAdditionalCommands(parentComponentView,userInputProperties.name);

                    //added the editor setup command
                    if(additionalCommandInfo.editorSetupCommand) commands.push(additionalCommandInfo.editorSetupCommand);

                    //add any delete commands
                    //NOTE - currently we do not overwiret, so this will not be triggered
                    if(additionalCommandInfo.deletedComponentCommands){
                        //flag a delete will be done
                        commandsDeleteComponent = true
                        deleteMsg = "This action will delete the selected cells. Are you sure you want to do that? Cells to delete: " + additionalCommandInfo.deletedComponentShortNames;

                        commands.push(...additionalCommandInfo.deletedComponentCommands);
                    } 
                }
            }

            //store create command
            commands.push(createCommandData);

            //add the editor insert command
            if((additionalCommandInfo)&&(additionalCommandInfo.editorAddCommand)) {
                commands.push(additionalCommandInfo.editorAddCommand);
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
            let doAction = () => {
                app.executeCommand(commandData);

                //give focus back to editor
                if(parentComponentView) {
                    parentComponentView.giveEditorFocusIfShowing();
                }
            }

            if(commandsDeleteComponent) {
                //if there is a delete, verify the user wants to do this
                let cancelAction = () => {
                    //give focus back to editor
                    if(parentComponentView) {
                        parentComponentView.giveEditorFocusIfShowing();
                    }
                };
                apogeeUserConfirm(deleteMsg,null,"OK","Cancel",doAction,cancelAction);
            }
            else {
                //otherwise just take the action
                doAction();
            }

            //return true to close the dialog
            return true;

        }

        //give foxus back to editor
        let onCancelFunction = () => null; /*parentComponentView.giveEditorFocusIfShowing() - oops no parent component*/;
        
        //show dialog
        showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}


/** This gets a callback to add an "additional" component, menaing one that is not
 * in the main component menu. */
export function addAdditionalComponent(appView,app,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues) {
        
    var onSelect = function(componentUniqueName) {
        let componentClass = componentInfo.getComponentClass(componentUniqueName);
        if(componentClass) {
            addComponent(appView,app,componentClass,optionalInitialProperties,optionalBaseMemberValues,optionalBaseComponentValues);
        }
        else {
            apogeeUserAlert("Unknown component type: " + componentType);
        }
    }
    //get the display names
    let additionalComponents = componentInfo.getAdditionalComponentNames();
    let componentInfoList = additionalComponents.map( componentName => {
        let componentClass = componentInfo.getComponentClass(componentName); 
        return {displayName: componentClass.displayName, uniqueName: componentName};
    });
    //open select component dialog
    showSelectComponentDialog(componentInfoList,onSelect);
}

/** This is to get an commands needed to add the a child node onto a parent page. */
function getAdditionalCommands(parentComponentView,childName) {
    //check selection
    let useParentSelection = getUseParentSelection(parentComponentView);
    
    let insertAtEnd = !useParentSelection;

    return parentComponentView.getInsertApogeeNodeOnPageCommands(childName,insertAtEnd);
}

function getUseParentSelection(parentComponentView) {
    //use the parent selection only if the tab is the active tab
    //otherwise the component should be placed at the end

    let tabDisplay = parentComponentView.getTabDisplay();
    if(!tabDisplay) return false;

    let tab = tabDisplay.getTab();
    if(!tab) return false;
    
    return tabDisplay.getIsShowing();
}
