

//=====================================
// UI Entry Point
//=====================================

export function saveWorkspace(app,fileAccessObject,doDirectSave) {

    var activeWorkspaceManager = app.getWorkspaceManager();
    var workspaceText;
    var fileMetadata;
    if(activeWorkspaceManager) {
        //fire a prepare save event so the UI can save its current state.
        activeWorkspaceManager.dispatchEvent("prepareSave",activeWorkspaceManager);

        var workspaceJson = activeWorkspaceManager.toJson();
        workspaceText = JSON.stringify(workspaceJson);
        fileMetadata = activeWorkspaceManager.getFileMetadata();
    }
    else {
        alert("There is no workspace open.");
        return;
    }

    //clear workspace dirty flag on completion of save
    var onSaveSuccess = (updatedFileMetadata) => {
        var workspaceManager = app.getWorkspaceManager();
        workspaceManager.setFileMetadata(updatedFileMetadata);
        workspaceManager.clearIsDirty();
    }

    if((!doDirectSave)||(!fileMetadata)||(!fileMetadata.directSaveOk)) {
        fileAccessObject.showSaveDialog(fileMetadata,workspaceText,onSaveSuccess);
    }
    else {
        fileAccessObject.saveFile(fileMetadata,workspaceText,onSaveSuccess);
    }
}
