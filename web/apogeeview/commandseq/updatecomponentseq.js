import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {validateTableName} from "/apogee/apogeeCoreLib.js"; 

import {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
export function updateComponent(component,componentView) {
    
    var componentClass = component.constructor;
    var componentViewClass = componentView.constructor;

    var displayName = componentClass.displayName
    var additionalLines = apogeeutil.jsonCopy(componentViewClass.propertyDialogLines); 

    var modelManager = component.getModelManager(); 
    var initialValues = component.getPropertyValues(); 

    //add folder list, only if we can set the parent (if there is a parent)
    var folderList = modelManager.getFolders();

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = getPropertiesDialogLayout(displayName,folderList,additionalLines,false,initialValues);

    //create on submit callback
    var onSubmitFunction = function(submittedValues) {
        
        //get the changed values
        var newValues = {};
        for(var key in initialValues) {
            if(initialValues[key] !== submittedValues[key]) {
                newValues[key] = submittedValues[key];
            }
        }
        
        var member = component.getMember();
        
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
            updateCommand.memberId = member.getId();
            if(numMemberProps > 0) updateCommand.updatedMemberProperties = memberUpdateJson;
            if(numComponentProps > 0) updateCommand.updatedComponentProperties = componentUpdateJson;
            commands.push(updateCommand)
        }
        
        //--------------
        // Move
        //--------------
        
        if((newValues.name)||(newValues.parentName)) {
            
            //validate the name
            if(newValues.name) {
                var nameResult = validateTableName(newValues.name);
                if(!nameResult.valid) {
                    alert(nameResult.errorMessage);
                    return false;
                }
            }

            let oldName = member.getName();
            let modelView;

            let renameEditorCommands;

            //do the first stage of editor commands
            if(componentViewClass.hasChildEntry) {
                //load model view, will be used for old parent and new parent
                modelView = componentView.getModelView();

                //look up the old parent component
                let oldParent = member.getParent();
                let oldParentComponentView = modelView.getComponentView(oldParent.getId());

                if(newValues.parentName) {
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
                    renameEditorCommands = oldParentComponentView.getRenameApogeeNodeCommands(member.getId(),oldName,newValues.name);
                    commands.push(renameEditorCommands.setupCommand);
                }
            }

//============================================
//simplify this by saving id in ui flow
let parent = modelManager.getComponentByFullName(submittedValues.parentName);
let parentId = parent.getId();
//=========================================
            
            //update the component name
            let moveCommand = {};
            moveCommand.type = "moveComponent";
            moveCommand.memberId = member.getId();
            moveCommand.newMemberName = submittedValues.name;
            moveCommand.newParentId = parentId;
            commands.push(moveCommand);

            //do the second stage of editor commands
            if(componentViewClass.hasChildEntry) {

                //-----------------------------------
                // move case
                // add the compone nodes to the new page after the component has been moved there
                //----------------------------------------------
                if(newValues.parentName) {
                    //look up the new parent component
                    let model = modelManager.getModel();
                    let newParent = model.getMemberByFullName(newValues.parentName);
                    let newParentComponentView = modelView.getComponentView(newParent.getId());

                    let newName = newValues.name ? newValues.name : oldName;

                    //insert node add at end of new page
                    let newParentCommands = newParentComponentView.getInsertApogeeNodeOnPageCommands(newName,true);
                    //added the editor setup command
                    if(newParentCommands.editorSetupCommand) commands.push(newParentCommands.editorSetupCommand);
                    //check if we need to add any delete component commands  - we shouldn't have any since we are not overwriting data here
                    if(newParentCommands.deletedComponentCommands) {
                        //make sure the user wants to proceed
                        let deletedComponentNames = newParentCommands.deletedComponentCommands.map(command => command.memberId);
                        let doDelete = confirm("Are you sure you want to delete these apogee nodes: " + deletedComponentNames);
                        
                        //return if user rejects
                        if(!doDelete) return;
                        
                        commands.push(...newParentCommands.deletedComponentCommands);
                    }

                    //add the editor insert command
                    if(newParentCommands.editorAddCommand) commands.push(newParentCommands.editorAddCommand);
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
        
        //execute command
        if(command) {   
            modelManager.getApp().executeCommand(command);
        }

        if(componentViewClass.hasChildDisplay) {
            //select the component and give focus to the parent editor if this is a child
            //NOTE - the if is not quite right. We shoudl only return to editor if the command origniated there.
            returnToEditor(component,submittedValues.name);
        }

        //return true to close the dialog
        return true;
    }

    //return focus to editor on cancel
    let onCancelFunction = () => returnToEditor(component);

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}

function returnToEditor(component,optionalNameToSelect) {
    let parentComponent = component.getParentComponent();
    if(parentComponent) {
        parentComponent.giveEditorFocusIfShowing();
//NOTE - this name select did nothing. ProseMirror supressed selection change for some reason. Look into this.
        // if(optionalNameToSelect) {
        //     parentComponent.selectApogeeNode(optionalNameToSelect);
        // }
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
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + displayName;
    }
    else {
        titleLine.title = "Update " + displayName; 
    }
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.heading = "Folder: ";
        parentLine.entries = folderNames;
        parentLine.resultKey = "parentName"; 
        lines.push(parentLine);
    }

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    nameLine.focus = true;
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    var submitLine = {};
    submitLine.type = "submit";
    if(doCreate) {
        submitLine.submit = "Create";
    }
    else {
        submitLine.submit = "Update";
    }
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    //set the initial values
    if(initialValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.resultKey) {
                line.initial = initialValues[line.resultKey];
            }
        }
    }
    
    return dialogLayout;
}









