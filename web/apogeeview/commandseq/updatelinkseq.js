import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";
import {showSimpleActionDialog} from "/apogeeview/dialogs/SimpleActionDialog.js";

const DIALOG_LAYOUT_URL_LINE = {
    "type": "textField",
    "label": "URL: ",
    "key": "url",
    "value": "",
    "focus": true
};
const DIALOG_LAYOUT_NICKNAME_LINE = {
    "type": "textField",
    "label": "Nickname (optional): ",
    "key": "nickname",
    "value": ""
};

//=====================================
// UI Entry Point
//=====================================

/** This method adds a link to the workspace. */
export function addLink(app,displayInfo) {
        
    //create the dialog layout 
    var titleLine = {};
    titleLine.type = "heading";
    titleLine.text = displayInfo.ADD_ENTRY_TEXT;
    titleLine.level = 3;

    var dialogLayout = {};
    dialogLayout.layout = [];
    dialogLayout.layout.push(titleLine);
    dialogLayout.layout.push(DIALOG_LAYOUT_URL_LINE);
    dialogLayout.layout.push(DIALOG_LAYOUT_NICKNAME_LINE);

    //create on submit callback
    var onSubmitFunction = function(newValues) {

        //validate url- for now just make sure it is not zero length
        if((!newValues.url)||(newValues.url.length === 0)) {
            alert("The url must not be empty");
            return false;
        }

        //create command json
        var commandData = {};
        commandData.type = "addLink";
        commandData.entryType = displayInfo.REFERENCE_TYPE;
        commandData.url = newValues.url;
        commandData.nickname = newValues.nickname;

        //run command
        app.executeCommand(commandData);

        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}

/** This method updates a link in the workspace. */
export function updateLink(app,referenceEntry,displayInfo) {
        
    var initialValues = {};
    initialValues.url = referenceEntry.getUrl();
    initialValues.nickname = referenceEntry.getNickname();
    if(initialValues.nickname == initialValues.url) initialValues.nickname = "";

    //create the dialog layout
    var titleLine = {};
    titleLine.type = "heading";
    titleLine.text = displayInfo.UPDATE_ENTRY_TEXT;
    titleLine.level = 3;

    var urlLine = apogeeutil.jsonCopy(DIALOG_LAYOUT_URL_LINE);
    urlLine.value = initialValues.url;
    var nicknameLine = apogeeutil.jsonCopy(DIALOG_LAYOUT_NICKNAME_LINE);
    nicknameLine.value = initialValues.nickname;

    var dialogLayout = {};
    dialogLayout.layout = [];
    dialogLayout.layout.push(titleLine);
    dialogLayout.layout.push(urlLine);
    dialogLayout.layout.push(nicknameLine);

    //create on submit callback
    var onSubmitFunction = function(newValues) {

        //validate url- for now just make sure it is not zero length
        if((!newValues.url)||(newValues.url.length === 0)) {
            alert("The url must not be empty");
            return false;
        }

        //run command
        var commandData = {};
        var dataChanged = false;
        commandData.type = "updateLink";
        commandData.entryType = displayInfo.REFERENCE_TYPE;
        commandData.oldUrl = initialValues.url;
        if(initialValues.url != newValues.url) {
            commandData.newUrl = newValues.url;
            dataChanged = true;
        }
        if(initialValues.nickname != newValues.nickname) {
            commandData.newNickname = newValues.nickname;
            dataChanged = true;
        }

        if(dataChanged) {
            app.executeCommand(commandData);
        }
            
        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}


/** This method deletes a link in the workspace. */
export function removeLink(app,referenceEntry,displayInfo) {

    var commandData = {};
        commandData.type = "deleteLink";
        commandData.entryType = displayInfo.REFERENCE_TYPE;
        commandData.url = referenceEntry.getUrl();

    //create on submit callback
    let doAction = () => app.executeCommand(commandData);
    let cancelAction = () => true;

    //verify the delete
    showSimpleActionDialog("Are you sure you want to delete this link?",null,["Delete","Cancel"],[doAction,cancelAction]);
}









