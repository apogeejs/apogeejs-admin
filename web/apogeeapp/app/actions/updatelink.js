apogeeapp.app.updatelink = {};

apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_JS_TITLE_LINE = {
    "type": "title",
    "title": "Add JS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_CSS_TITLE_LINE = {
    "type": "title",
    "title": "Add CSS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_JS_TITLE_LINE = {
    "type": "title",
    "title": "Update JS Link"
};
apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_CSS_TITLE_LINE = {
    "type": "title",
    "title": "Update CSS Link"
};
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
apogeeapp.app.updatelink.getAddLinkCallback = function(referencesUI,linkType) {
    
    var createCallback = function() {
        
        var initialValues = {};
        
        //create the dialog layout 
        var titleLine = (linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) ? 
            apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_JS_TITLE_LINE :
            apogeeapp.app.updatelink.DIALOG_LAYOUT_ADD_CSS_TITLE_LINE;
    
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
            entryJson.entryType = linkType;
            var promise = referencesUI.addEntry(entryJson);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getUpdateLinkCallback = function(linkEntry) {
    
    var createCallback = function() {
        
        var initialValues = {};
        initialValues.url = linkEntry.getUrl();
        initialValues.nickname = linkEntry.getNickname();
        if(initialValues.nickname == initialValues.url) initialValues.nickname = "";
        
        //create the dialog layout
        var titleLine = (linkEntry.getEntryType() == apogeeapp.app.LinkEntry.LINK_TYPE_JS) ? 
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_JS_TITLE_LINE :
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_CSS_TITLE_LINE;
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
            
            //not sure what to do with promise
            linkEntry.updateData(newValues.url,newValues.nickname);

            //return true to close the dialog
            return true;
        }
        
        //show dialog
        apogeeapp.app.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}


/** This method gets a callback to update the properties of a workspace. */
apogeeapp.app.updatelink.getRemoveLinkCallback = function(linkEntry) {
    
    var createCallback = function() {

        var doDelete= confirm("Are you sure you want to delete this link?");
        
        //create on submit callback
        if(doDelete) {
            linkEntry.remove();
        }
        
    }
    
    return createCallback;
    
}











