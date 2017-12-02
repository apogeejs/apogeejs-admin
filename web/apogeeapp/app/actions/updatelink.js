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
    "resultKey": "nickName",
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
apogeeapp.app.updatelink.getAddLinkCallback = function(libraryUI,linkType) {
    
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
            var promise = libraryUI.addLink(newValues.url,newValues.nickName,linkType);

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
        initialValues.nickName = linkEntry.getNickName();
        if(initialValues.nickName == initialValues.url) initialValues.nickName = "";
        
        //create the dialog layout
        var titleLine = (linkEntry.getLinkType() == apogeeapp.app.LinkEntry.LINK_TYPE_JS) ? 
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_JS_TITLE_LINE :
            apogeeapp.app.updatelink.DIALOG_LAYOUT_UPDATE_CSS_TITLE_LINE;
        var urlLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_URL_LINE);
        urlLine.initial = initialValues.url;
        var nickNameLine = apogee.util.jsonCopy(apogeeapp.app.updatelink.DIALOG_LAYOUT_NICKNAME_LINE);
        nickNameLine.initial = initialValues.nickName;
        
        var dialogLayout = {};
        dialogLayout.lines = [];
        dialogLayout.lines.push(titleLine);
        dialogLayout.lines.push(urlLine);
        dialogLayout.lines.push(nickNameLine);
        dialogLayout.lines.push(apogeeapp.app.updatelink.DIALOG_LAYOUT_SUBMIT_LINE);
        
        //create on submit callback
        var onSubmitFunction = function(newValues) {

            //validate url- for now just make sure it is not zero length
            if((!newValues.url)||(newValues.url.length === 0)) {
                alert("The url must not be empty");
                return false;
            }
            
            //not sure what to do with promise
            linkEntry.updateData(newValues.url,newValues.nickName);

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











