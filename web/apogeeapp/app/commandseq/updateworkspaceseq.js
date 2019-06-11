apogeeapp.app.updateworkspaceseq = {};

apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_TITLE_LINE = {
    "type": "title",
    "title": "Update Workspace"
};
apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_NAME_LINE = {
    "type": "inputElement",
    "heading": "Name: ",
    "resultKey": "name",
    "initial": ""
};
apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updateworkspaceseq.updateWorkspaceProperties = function(workspaceUI) {
        
    var workspace = workspaceUI.getWorkspace();

    //load initial values
    var initialValues = {};
    initialValues.name = workspace.getName();

    //create the dialog layout
    var nameLine = apogee.util.jsonCopy(apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_NAME_LINE);
    nameLine.initial = initialValues.name;

    var dialogLayout = {};
    dialogLayout.lines = [];
    dialogLayout.lines.push(apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_TITLE_LINE);
    dialogLayout.lines.push(nameLine);
    //(add any workspace ui lines here)
    dialogLayout.lines.push(apogeeapp.app.updateworkspaceseq.DIALOG_LAYOUT_SUBMIT_LINE);

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





