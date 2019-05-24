apogeeapp.app.updatelink = {};

apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE = {
    "type": "inputElement",
    "heading": "URL: ",
    "resultKey": "url",
    "initial": ""
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE = {
    "type": "inputElement",
    "heading": "Nickname (optional): ",
    "resultKey": "nickname",
    "initial": ""
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE = {
    "type": "submit",
    "submit": "Update",
    "cancel": "Cancel"
}

//=====================================
// UI Entry Point
//=====================================

//itemInfo.callback = apogeeapp.app.updatelink.getAddLinkCallback(this,linkType);

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getAddLinkCallback = function(referenceManager,entryTypeInfo) {
    
    var createCallback = function() {
        
        //create the dialog layout 
        var titleLine = {};
        titleLine.type = "title";
        titleLine.title = entryTypeInfo.ADD_ENTRY_TEXT
    
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(titleLine);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {

            //validate url- for now just make sure it is not zero length
            if((!newValues.url)||(newValues.url.length === 0)) {
                alert("The url must not be empty");
                return false;
            }

            //not sure what to do with promise
            var entryJson = {};
            entryJson.url = newValues.url;
            entryJson.nickname = newValues.nickname;
            entryJson.entryType = entryTypeInfo.REFERENCE_TYPE;
            
            //run command
            var command = apogeeapp.app.updatelink.createAddEntryCommand(referenceManager,entryJson);
            apogeeapp.app.Apogee.getInstance().executeCommand(command);
            
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getUpdateLinkCallback = function(referenceEntry) {
    
    var createCallback = function() {
        
        var initialValues = {};
        initialValues.url = referenceEntry.getUrl();
        initialValues.nickname = referenceEntry.getNickname();
        if(initialValues.nickname == initialValues.url) initialValues.nickname = "";
        
        var entryTypeInfo = referenceEntry.getTypeInfo();
        
        //create the dialog layout
        var titleLine = {};
        titleLine.type = "title";
        titleLine.title = entryTypeInfo.UPDATE_ENTRY_TEXT;
        
        var urlLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE);
        urlLine.initial = initialValues.url;
        var nicknameLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE);
        nicknameLine.initial = initialValues.nickname;
        
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(titleLine);
        dialogLayout.lines.push(urlLine);
        dialogLayout.lines.push(nicknameLine);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {

            //validate url- for now just make sure it is not zero length
            if((!newValues.url)||(newValues.url.length === 0)) {
                alert("The url must not be empty");
                return false;
            }
            
            //run command
            var command = apogeeapp.app.updatelink.createUpdateEntryCommand(referenceEntry,newValues.url,newValues.nickname);
            apogeeapp.app.Apogee.getInstance().executeCommand(command);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}


/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getRemoveLinkCallback = function(referenceEntry) {
    
    var createCallback = function() {

        var doDelete= confirm("Are you sure you want to delete this link?");
        
        //create on submit callback
        if(doDelete) {
            
            //run command
            var command = apogeeapp.app.updatelink.createRemoveEntryCommand(referenceEntry);
            apogeeapp.app.Apogee.getInstance().executeCommand(command);
        }
        
    }
    
    return createCallback;
    
}

//internal functions

apogeeapp.app.updatelink.createAddEntryCommand = function(referenceManager,entryJson) {
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doAddEntry(referenceManager,entryJson);
    command.undoCmd = () => apogeeapp.app.updatelink.doRemoveEntry(referenceManager,entryJson.entryType,entryJson.url)
    command.desc = "Insert reference: " + (entryJson.nickname ? entryJson.nickname : entryJson.url);
    return command;
}

apogeeapp.app.updatelink.createUpdateEntryCommand = function(referenceEntry,newUrl,newNickname) {
    var referenceManager = referenceEntry.getReferenceManager();
    var entryType = referenceEntry.getEntryType();
    var oldUrl = referenceEntry.getUrl();
    var oldNickname = referenceEntry.getNickname();
    
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doUpdateEntry(referenceManager,entryType,oldUrl,newUrl,newNickname);
    command.undoCmd = () => apogeeapp.app.updatelink.doUpdateEntry(referenceManager,entryType,newUrl,oldUrl,oldNickname);
    command.desc = "Update reference: " + (oldNickname ? oldNickname : oldUrl);
    return command;
}

apogeeapp.app.updatelink.createRemoveEntryCommand = function(referenceEntry) {
    var referenceManager = referenceEntry.getReferenceManager();
    var entryJson = {};
    entryJson.entryType = referenceEntry.getEntryType();
    entryJson.url = referenceEntry.getUrl();
    entryJson.nickname = referenceEntry.getNickname();
    
    var command = {};
    command.cmd = () => apogeeapp.app.updatelink.doRemoveEntry(referenceManager,entryJson.entryType,entryJson.url);
    command.undoCmd = () => apogeeapp.app.updatelink.doAddEntry(referenceManager,entryJson);
    command.desc = "Remove reference: " + (entryJson.nickname ? entryJson.nickname : entryJson.url);
    return command;
}

/** This is the command function to add a reference entry */
apogeeapp.app.updatelink.doAddEntry = function(referenceManager,entryJson) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //add entry function
        var promise = referenceManager.addEntry(entryJson);

        promise.catch(errorMsg => {alert("There was an error loading the link: " + errorMsg);});
    }
    catch(error) {
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This is the command function to update a reference entry */
apogeeapp.app.updatelink.doUpdateEntry = function(referenceManager,entryType,oldUrl,newUrl,newNickname) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(entryType,oldUrl);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.updateData(newUrl,newNickname);
        }
        else {
            //entry not found
            var actionError = new apogee.ActionError("Entry to update not found!",apogee.ActionError.ERROR_TYPE_APP);
            actionResponse.addError(actionError);
        }
    }
    catch(error) {
        //unkown error
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}

/** This is the command function to delete a reference entry */
apogeeapp.app.updatelink.doRemoveEntry = function(referenceManager,entryType,url) {
    var actionResponse = new apogee.ActionResponse();
    try {
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(entryType,url);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.remove();
        }
        else {
            //entry not found
            var actionError = new apogee.ActionError("Entry to delete not found!",apogee.ActionError.ERROR_TYPE_APP);
            actionResponse.addError(actionError);
        }
    }
    catch(error) {
        //unkown error
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}











