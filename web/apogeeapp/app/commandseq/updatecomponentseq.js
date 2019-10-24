import util from "/apogeeutil/util.js";
import {validateTableName} from "/apogee/lib/codeCompiler.js"; 

import {showConfigurableDialog} from "/apogeeapp/app/dialogs/ConfigurableDialog.js";

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
export function updateComponent(component) {
    
    var componentGenerator = component.componentGenerator;

    var displayName = componentGenerator.displayName
    var additionalLines = util.jsonCopy(componentGenerator.propertyDialogLines); 

    var workspaceUI = component.getWorkspaceUI(); 
    var workspace = component.getWorkspace();
    var initialValues = component.getPropertyValues(); 

    //add folder list, only if we can set the parent (if there is a parent)
    var folderList = workspaceUI.getFolders();

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
        var memberFullName = member.getFullName();
        
        var commands = [];
        
        //--------------
        // Update Properties
        //--------------
        var componentGenerator = component.componentGenerator;
        
        var memberUpdateJson = {};
        if(componentGenerator.transferMemberProperties) {
            componentGenerator.transferMemberProperties(newValues,memberUpdateJson);
        }
        var numMemberProps = util.jsonObjectLength(memberUpdateJson);
        
        var componentUpdateJson = {};
        if(componentGenerator.transferComponentProperties) {
            componentGenerator.transferComponentProperties(newValues,componentUpdateJson);
        }
        var numComponentProps = util.jsonObjectLength(componentUpdateJson);
        
        if((numMemberProps > 0)||(numComponentProps > 0)) {
            let updateCommand = {};
            updateCommand.type = "updateComponent";
            updateCommand.memberFullName = memberFullName;
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
            
            let moveCommand = {};
            moveCommand.type = "moveComponent";
            moveCommand.memberFullName = memberFullName;
            moveCommand.newMemberName = submittedValues.name;
            moveCommand.newParentFullName = submittedValues.parentName;
            commands.push(moveCommand);

            //create the editor move command if needed
            if(component.usesChildDisplay()) {
                let oldName = member.getName();
                let oldParent = member.getParent();
                let oldParentComponent = workspaceUI.getComponent(oldParent);

                if(newValues.parentName) {
                    let newParent = workspace.getMemberByFullName(newValues.parentName);
                    let newParentComponent = workspaceUI.getComponent(newParent);

                    //delete old parent apogee node 
                    let oldParentEditorCommand = oldParentComponent.getRemoveApogeeNodeFromPageCommand(oldName);
                    commands.push(oldParentEditorCommand);

                    //insert node add at end of new page
                    let newParentCommands = newParentComponent.getInsertApogeeNodeOnPageCommands(newValues.name,true);
                    //check if we need to add any delete component commands - we should not if we place at end
                    if(newParentCommands.deletedComponentCommands) commands.push(...newParentCommands.deletedComponentCommands);
                    //added the editor command to insert the component
                    if(newParentCommands.editorCommand) commands.push(newParentCommands.editorCommand);
                }
                if(newValues.name) {
                    //update apogee node name
                    let editorCommand = oldParentComponent.getRenameApogeeNodeCommand(oldName,newValues.name);
                    commands.push(editorCommand);
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
            workspaceUI.getApp().executeCommand(command);
        }

        if(component.usesChildDisplay()) {
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









