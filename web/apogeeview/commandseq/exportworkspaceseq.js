import {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";

//=====================================
// UI Entry Point
//=====================================


/** This gets a callback to add a component. */
export function exportWorkspace(app,fileAccessObject) {
    //get the active workspace
    var workspaceManager = app.getWorkspaceManager();
    if(!workspaceManager) {
        alert("There is no open workspace.");
        return;
    }   

    var modelManager = workspaceManager.getModelManager();

    //get the folder list (do not include root, or else we could just save the whole workspace)
    var parentList = modelManager.getParentList(false);

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = getExportDialogLayout(parentList);

    //create on submit callback
    var onSubmitFunction = function(result) {         
        var model = modelManager.getModel();
        var folder = model.lookupMemberById(result.parentId);

        var workspaceText = getWorkspaceText(app,folder);
        if(!workspaceText) {
            alert("There is no workspace open.");
            return;
        }

        let onSave = (err,fileSaved,fileMetadata) => {
            if(err) {
                alert("There was an error saving the file: " + err.toString());
            }
        }

        //no command used here - we should add thatlogic in
        //along with having proper error handling
        fileAccessObject.saveFileAs(null,workspaceText,onSave);

        //return true to close the dialog
        return true;
    }

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction);
}
    

function getWorkspaceText(app,folder) {
    var activeWorkspaceManager = app.getWorkspaceManager();
    if(activeWorkspaceManager) {
        var workspaceJson = activeWorkspaceManager.toJson(folder);
        return JSON.stringify(workspaceJson);
    }
    else {
        return undefined;
    }
}

//---------------------------------
// private functions
//---------------------------------

/** FolderInfo is a format compatible with the comfigurable dialog - a list of names or a list of entries [id,name] 
 * @private */
function getExportDialogLayout(folderInfo) {
        
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
        parentLine.entries = folderInfo;
        parentLine.resultKey = "parentId"; 
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
