

visicomp.app.visiui.addcomponent = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.addcomponent.getAddComponentCallback = function(app,generator) {
    
    var createCallback = function() {
        //get the active workspace
        var workspaceUI = app.getActiveWorkspaceUI();
        if(!workspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        
        //create the dialog layout - do on the fly because folder list changes
        var dialogLayout = visicomp.app.visiui.addcomponent.getDialogLayout(workspaceUI,null,generator,true);
        
        //create on submit callback
        var onSubmitFunction = function(result) {
            var parent = workspaceUI.getObjectByKey(result.parentKey);
            var name = result.name;

            //test if name is valid!!!

            var actionResponse =  generator.createComponent(workspaceUI,parent,name);   
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg())
            }
            //return true to close the dialog
            return true;
        }
        
        //show dialog
        visicomp.app.visiui.dialog.showConfigurableDialog(dialogLayout,onSubmitFunction);
    }
    
    return createCallback;
    
}

//this is for a create or update dialog
visicomp.app.visiui.addcomponent.getDialogLayout = function(workspaceUI,parent,generator,doCreate) {
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    if(doCreate) {
        titleLine.title = "New " + generator.displayName;
    }
    else {
        titleLine.title = "Update " + generator.displayName; 
    }
    lines.push(titleLine);

    var parentLine = {};
    parentLine.type = "dropdown";
    parentLine.heading = "Folder: ";
    parentLine.entries = workspaceUI.getFolderList();
    if(parent) {
        parentLine.initial = parent.getKey();
    }
    parentLine.resultKey = "parentKey";
    lines.push(parentLine);

    var nameLine = {};
    nameLine.type = "inputElement";
    nameLine.heading = "Name: ";
    nameLine.resultKey = "name";
    lines.push(nameLine);

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
    
    return dialogLayout;
}

//=====================================
// Action
//=====================================

//action is in the component generator






