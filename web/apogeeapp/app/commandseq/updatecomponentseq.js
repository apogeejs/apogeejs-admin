import util from "/apogeeutil/util.js";
import {validateTableName} from "/apogee/lib/codeCompiler.js"; 

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
export function updateComponent(component) {
    
    var componentGenerator = component.componentGenerator;

    var displayName = componentGenerator.displayName
    var additionalLines = util.jsonCopy(componentGenerator.propertyDialogLines); 

    var workspaceUI = component.getWorkspaceUI(); 
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
        
        var updateCommand;
        var moveCommand;
        
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
            updateCommand = {};
            updateCommand.type = "updateComponent";
            updateCommand.memberFullName = memberFullName;
            if(numMemberProps > 0) updateCommand.updatedMemberProperties = memberUpdateJson;
            if(numComponentProps > 0) updateCommand.updatedComponentProperties = componentUpdateJson;
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
            
            moveCommand = {};
            moveCommand.type = "moveComponent";
            moveCommand.memberFullName = memberFullName;
            moveCommand.newMemberName = submittedValues.name;
            moveCommand.newParentFullName = submittedValues.parentName;
        }
        
        //---------------
        // combine commands (as needed)
        //---------------

        var command;
        
        if((updateCommand)&&(moveCommand)) {
            //make a compound command
            command = {};
            command.type = "compound";
            command.childCommands = {};
            command.childCommands.push(updateCommand);
            command.childCommands.push(moveCommand);
        }
        else if(updateCommand) {
            command = updateCommand;
        }
        else if(moveCommand) {
            command = moveCommand;
        }
        
        //execute command
        if(command) {
            var workspaceUI = component.getWorkspaceUI();     
            workspaceUI.getApp().executeCommand(command);
        }

        //return true to close the dialog
        return true;
    }

    //show dialog
    apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
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









