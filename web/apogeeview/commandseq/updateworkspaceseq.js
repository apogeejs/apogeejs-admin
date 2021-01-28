import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {showConfigurableDialog} from "/apogeeui/apogeeUiLib.js";

const DIALOG_LAYOUT_TITLE_LINE = {
    "type": "heading",
    "text": "Update Workspace",
    "level": 3
};
const DIALOG_LAYOUT_NAME_LINE = {
    "type": "textField",
    "label": "Name: ",
    "size": 40,
    "key": "name",
    "initial": "",
    "focus": true
};

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a workspace. */
export function updateWorkspaceProperties(workspaceManager) {
        
    var model = workspaceManager.getModelManager().getModel();

    //load initial values
    var initialValues = {};
    initialValues.name = model.getName();

    //create the dialog layout
    var nameLine = apogeeutil.jsonCopy(DIALOG_LAYOUT_NAME_LINE);
    nameLine.value = initialValues.name;

    var dialogLayout = {};
    dialogLayout.layout = [];
    dialogLayout.layout.push(DIALOG_LAYOUT_TITLE_LINE);
    dialogLayout.layout.push(nameLine);
    //(add any workspace ui lines here)

    //create on submit callback
    var onSubmitFunction = function(newValues) {

        var valuesChanged = false;

        //validate the name, if it changed
        if(newValues.name !== initialValues.name) {
            //validate name - for now just make sure it is not zero length
            if(newValues.length === 0) {
                apogeeUserAlert("The name must not be empty");
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

            workspaceManager.getApp().executeCommand(commandData);
        }

        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}





