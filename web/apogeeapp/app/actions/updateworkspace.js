apogeeapp.app.updateworkspace = {};

apogeeapp.app.updateworkspace.DIALOG_LAYOUT_TITLE_LINE = {
    "type": "title",
    "title": "Update Workspace"
};
apogeeapp.app.updateworkspace.DIALOG_LAYOUT_NAME_LINE = {
    "type": "inputElement",
    "heading": "Name: ",
    "resultKey": "name",
    "initial": ""
};
apogeeapp.app.updateworkspace.DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updateworkspace.updateWorkspaceProperties = function(workspaceUI) {
        
    var workspace = workspaceUI.getWorkspace();

    //load initial values
    var initialValues = {};
    initialValues.name = workspace.getName();

    //create the dialog layout
    var nameLine = apogee.util.jsonCopy(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_NAME_LINE);
    nameLine.initial = initialValues.name;

    var dialogLayout = {};
    dialogLayout.lines = [];
    dialogLayout.lines.push(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_TITLE_LINE);
    dialogLayout.lines.push(nameLine);
    //(add any workspace ui lines here)
    dialogLayout.lines.push(apogeeapp.app.updateworkspace.DIALOG_LAYOUT_SUBMIT_LINE);

    //create on submit callback
    var onSubmitFunction = function(newValues) {

        var valuesChanged = false;

        //validate the name, if it changed
        if(newValues.name !== initialValues.name) {
            //validate name - for now just make sure it is not zero length
            if(newValues.length === 0) {
                alert("The name must not be empty");
                return false;
            }

            valuesChanged = true;
        }

        //validate any other fields here

        //update
        if(valuesChanged) {
            var command = apogeeapp.app.updateworkspace.createUpdatePropertyValuesCommand(workspaceUI,initialValues,newValues);
            workspaceUI.getApp().executeCommand(command);
        }

        //return true to close the dialog
        return true;
    }

    //show dialog
    apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
}

//=====================================
// Action
//=====================================

apogeeapp.app.updateworkspace.createUpdatePropertyValuesCommand = function(workspaceUI,oldValues,newValues) {
    var command = {};
    command.cmd = () => apogeeapp.app.updateworkspace.updatePropertyValues(workspaceUI,oldValues,newValues);
    command.undoCmd = () => apogeeapp.app.updateworkspace.updatePropertyValues(workspaceUI,newValues,oldValues);
    command.desc = "Update workspace properties"
    return command;
}


/** This method is used for updating property values from the property dialog. */
apogeeapp.app.updateworkspace.updatePropertyValues = function(workspaceUI,oldValues,newValues) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResponse = new apogee.ActionResponse();
    
    //check if rename is needed
    if(oldValues.name !== newValues.name) {
        var actionData;
        actionData = {};
        actionData.action = "updateWorkspace";
        actionData.workspace = workspace;
        actionData.name = newValues.name;
        
        actionResponse = apogee.action.doAction(actionData,true,null,actionResponse);
    }
    
    //update any workspace ui properties here
        
    return actionResponse;
}












