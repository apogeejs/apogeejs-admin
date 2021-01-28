import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {validateTableName} from "/apogee/apogeeCoreLib.js"; 

import {showConfigurableDialog} from "/apogeeui/apogeeUiLib.js";

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
export function updateComponent(componentView) {

    var app = componentView.getApp();
    var modelManager = app.getModelManager(); 
    var component = componentView.getComponent();
    
    var componentClass = component.constructor;
    var componentViewClass = componentView.constructor;

    var displayName = componentClass.displayName
    var additionalLines = apogeeutil.jsonCopy(componentViewClass.propertyDialogLines); 

    var initialValues = component.getPropertyValues(modelManager.getModel()); 

    // add the folders to which we can move this (it can move to root only if it is a parent)
    let includeRootFolder = componentViewClass.hasTabEntry;
    var parentList = modelManager.getParentList(includeRootFolder);

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = getPropertiesDialogLayout(displayName,parentList,additionalLines,false,initialValues);

    //create on submit callback
    var onSubmitFunction = function(submittedValues) {
        
        //get the changed values
        var newValues = {};
        for(var key in initialValues) {
            if(initialValues[key] !== submittedValues[key]) {
                newValues[key] = submittedValues[key];
            }
        }
        
        let commandsDeleteComponent = false;
        let deleteMsg;
        var commands = [];
        
        //--------------
        // Update Properties
        //--------------
        
        var memberUpdateJson = {};
        if(componentClass.transferMemberProperties) {
            componentClass.transferMemberProperties(newValues,memberUpdateJson);
        }
        var numMemberProps = apogeeutil.jsonObjectLength(memberUpdateJson);
        
        var componentUpdateJson = {};
        if(componentClass.transferComponentProperties) {
            componentClass.transferComponentProperties(newValues,componentUpdateJson);
        }
        var numComponentProps = apogeeutil.jsonObjectLength(componentUpdateJson);
        
        if((numMemberProps > 0)||(numComponentProps > 0)) {
            let updateCommand = {};
            updateCommand.type = "updateComponent";
            updateCommand.memberId = component.getMemberId();
            if(numMemberProps > 0) updateCommand.updatedMemberProperties = memberUpdateJson;
            if(numComponentProps > 0) updateCommand.updatedComponentProperties = componentUpdateJson;
            commands.push(updateCommand)
        }
        
        //--------------
        // Move
        //--------------
        
        if((newValues.name)||(newValues.parentId)) {
            
            //validate the name
            if(newValues.name) {
                var nameResult = validateTableName(newValues.name);
                if(!nameResult.valid) {
                    apogeeUserAlert(nameResult.errorMessage);
                    return false;
                }
            }

            let oldName = component.getName();

            let renameEditorCommands;

            //do the first stage of editor commands
            if(componentViewClass.hasChildEntry) {
                //load model view, will be used for old parent and new parent
                let appViewInterface = componentView.getAppViewInterface();

                if(appViewInterface.hasParentDisplays()) {
                    //look up the old parent component
                    let oldParentComponent = component.getParentComponent(modelManager);
                    //remove the component from the parent component document.
                    //if there is no parent component, we wil assume this was in the root folder
                    if(oldParentComponent) {
                        let oldParentComponentView = appViewInterface.getComponentViewByComponentId(oldParentComponent.getId());

                        if(newValues.parentId) {
                            //----------------------------
                            //move case
                            //delete old node
                            //----------------------------
                            let oldParentEditorCommand = oldParentComponentView.getRemoveApogeeNodeFromPageCommand(oldName);
                            commands.push(oldParentEditorCommand);
                        }
                        else if(newValues.name) {
                            //---------------------------
                            //rename case
                            //get the rename editr comamnds, then apply the one to clear the component node name
                            //----------------------------
                            renameEditorCommands = oldParentComponentView.getRenameApogeeNodeCommands(component.getMemberId(),oldName,newValues.name);
                            commands.push(renameEditorCommands.setupCommand);
                        }
                    }
                }
            }
            
            //update the component name
            let moveCommand = {};
            moveCommand.type = "moveComponent";
            moveCommand.memberId = component.getMemberId();
            moveCommand.newMemberName = submittedValues.name;
            moveCommand.newParentId = newValues.parentId;
            commands.push(moveCommand);

            //do the second stage of editor commands
            if(componentViewClass.hasChildEntry) {

                //-----------------------------------
                // move case
                // add the compone nodes to the new page after the component has been moved there
                //----------------------------------------------
                if(newValues.parentId) {
                    let newParentComponentId = modelManager.getComponentIdByMemberId(newValues.parentId);
                    //there will be no component id if we are putting this in the root folder
                    if(newParentComponentId) {
                        let appViewInterface = componentView.getAppViewInterface();
                        if(appViewInterface.hasParentDisplays()) {
                            let newParentComponentView = appViewInterface.getComponentViewByComponentId(newParentComponentId);

                            if(newParentComponentView) {
                                let newName = newValues.name ? newValues.name : oldName;

                                //insert node add at end of new page
                                let newParentCommands = newParentComponentView.getInsertApogeeNodeOnPageCommands(newName,true);
                                //added the editor setup command
                                if(newParentCommands.editorSetupCommand) commands.push(newParentCommands.editorSetupCommand);
                                //check if we need to add any delete component commands  - we shouldn't have any since we are not overwriting data here
                                if(newParentCommands.deletedComponentCommands) {
                                    //flag a delete will be done
                                    commandsDeleteComponent = true
                                    deleteMsg = "This action deletes cells on the new page. Are you sure you want to do that? Deleted cells: " + deletedComponentNames;
                                    
                                    //return if user rejects
                                    if(!doDelete) return;
                                    
                                    commands.push(...newParentCommands.deletedComponentCommands);
                                }

                                //add the editor insert command
                                if(newParentCommands.editorAddCommand) commands.push(newParentCommands.editorAddCommand);
                            }
                        }
                    }
                    else {
                        if(!componentViewClass.hasTabEntry) {
                            //TBR if we want to enforce this condition...
                            throw new Error("This component can not be placed in the root folder.");
                        }
                    }

                }

                //----------------------------
                //rename case
                //set the new node name, after the compnoent rename is done
                //-------------------------------------------
                if(renameEditorCommands) {
                    //update apogee node name
                    commands.push(renameEditorCommands.setNameCommand);
                }
            }

        }
        
        //---------------
        // combine commands (as needed)
        //---------------

        var command;
        
        if(commands.length > 1) {
            //make a compound command
            command = {};
            command.type = "compoundCommand";
            command.childCommands = commands;
        }
        else if(commands.length === 1) {
            command = commands[0];
        }
        
        //command action
        let doAction = () => {
            if(command) {   
                app.executeCommand(command);
            }

            returnToEditor(componentView,submittedValues.name);
        }

        if(commandsDeleteComponent) {
            //if there is a delete, verify the user wants to do this
            let cancelAction = () => {
                returnToEditor(componentView,submittedValues.name);
            };
            apogeeUserConfirm(deleteMsg,"Delete","Cancel",doAction,cancelAction);
        }
        else {
            //otherwise just take the action
            doAction();
        }

        //return true to close the dialog
        return true;
    }

    //return focus to editor on cancel
    let onCancelFunction = () => returnToEditor(componentView);

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}

function returnToEditor(componentView) {
    let componentViewClass = componentView.constructor;
    if(componentViewClass.hasChildDisplay) {
        let parentComponentView = componentView.getParentComponentView();
        if(parentComponentView) {
            parentComponentView.giveEditorFocusIfShowing();
        }
    }
}

//========================
// dialog setup - this is shared with add component since it is the same basic action
//========================

//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
export function getPropertiesDialogLayout(displayName,folderNames,additionalLines,doCreate,initialValues) { 
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.layout = lines;

    var titleLine = {};
    titleLine.type = "heading";
    if(doCreate) {
        titleLine.text = "New " + displayName;
    }
    else {
        titleLine.text = "Update " + displayName; 
    }
    titleLine.level = 3;
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.label = "Parent Page: ";
        parentLine.entries = folderNames;
        parentLine.key = "parentId"; 
        if(doCreate) {
            parentLine.state = "disabled";
        }
        lines.push(parentLine);
    }

    var nameLine = {};
    nameLine.type = "textField";
    nameLine.label = "Name: ";
    nameLine.size = 40,
    nameLine.key = "name";
    nameLine.focus = true;
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    // var submitLine = {};
    // submitLine.type = "submit";
    // if(doCreate) {
    //     submitLine.submit = "Create";
    // }
    // else {
    //     submitLine.submit = "Update";
    // }
    // submitLine.cancel = "Cancel";
    // lines.push(submitLine);
    
    //set the initial values
    if(initialValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.key) {
                line.value = initialValues[line.key];
            }
        }
    }
    
    return dialogLayout;
}









