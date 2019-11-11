import util from "/apogeeutil/util.js";

import {showConfigurableDialog} from "/apogeeapp/app/dialogs/ConfigurableDialog.js";

const DIALOG_LAYOUT_TITLE_LINE = {
    "type": "title",
    "title": "Update Workspace"
};
const DIALOG_LAYOUT_NAME_LINE = {
    "type": "inputElement",
    "heading": "Name: ",
    "resultKey": "name",
    "initial": "",
    "focus": true
};
const DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a workspace. */
export function updateWorkspaceProperties(workspaceUI) {
        
    var workspace = workspaceUI.getWorkspace();

    //load initial values
    var initialValues = {};
    initialValues.name = workspace.getName();

    //create the dialog layout
    var nameLine = util.jsonCopy(DIALOG_LAYOUT_NAME_LINE);
    nameLine.initial = initialValues.name;

    var dialogLayout = {};
    dialogLayout.lines = [];
    dialogLayout.lines.push(DIALOG_LAYOUT_TITLE_LINE);
    dialogLayout.lines.push(nameLine);
    //(add any workspace ui lines here)
    dialogLayout.lines.push(DIALOG_LAYOUT_SUBMIT_LINE);

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
            var commandData = {};
            commandData.type = "updateWorkspace";
            commandData.updatedCoreProperties = {};
            commandData.updatedCoreProperties.name = newValues.name;

            workspaceUI.getApp().executeCommand(commandData);
        }

        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}





