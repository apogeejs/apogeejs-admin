import {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";

//=====================================
// UI Entry Point
//=====================================


/** This gets a callback to add a component. */
export function exportWorkspace(app,fileAccessObject) {
    //get the active workspace
    var workspaceUI = app.getWorkspaceUI();
    if(!workspaceUI) {
        alert("There is no open workspace.");
        return;
    }   

    //get the folder list
    var folderNames = workspaceUI.getFolders();

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = getExportDialogLayout(folderNames);

    //create on submit callback
    var onSubmitFunction = function(result) {         
        var folderFullName = result.parentName;
        var workspace = workspaceUI.getWorkspace();
        var folder = workspace.lookupMemberByName(folderFullName);

        var workspaceText = getWorkspaceText(app,folder);
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }

        //no command used here - we should add thatlogic in
        //along with having proper error handling
        fileAccessObject.showSaveDialog(null,workspaceText,null);

        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}
    

function getWorkspaceText(app,folder) {
    var activeWorkspaceUI = app.getWorkspaceUI();
    if(activeWorkspaceUI) {
        var workspaceJson = activeWorkspaceUI.toJson(folder);
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}

//---------------------------------
// private functions
//---------------------------------

/** @private */
function getExportDialogLayout(folderNames) {
        
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.lines = lines;

    var titleLine = {};
    titleLine.type = "title";
    titleLine.title = "Export Folder as Workspace"
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.heading = "Folder: ";
        parentLine.entries = folderNames;
        parentLine.resultKey = "parentName"; 
        parentLine.focus = true;
        lines.push(parentLine);
    }
    
    //submit
    var submitLine = {};
    submitLine.type = "submit";
    submitLine.submit = "OK";
    submitLine.cancel = "Cancel";
    lines.push(submitLine);
    
    return dialogLayout;
}
