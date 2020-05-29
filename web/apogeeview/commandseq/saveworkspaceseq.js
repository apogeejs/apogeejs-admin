

//=====================================
// UI Entry Point
//=====================================

export function saveWorkspace(app,fileAccessObject,doDirectSave) {

    var activeWorkspaceManager = app.getWorkspaceManager();
    var workspaceText;
    var fileMetadata;
    if(activeWorkspaceManager) {
        var workspaceJson = activeWorkspaceManager.toJson();
        workspaceText = JSON.stringify(workspaceJson);
        fileMetadata = activeWorkspaceManager.getFileMetadata();
    }
    else {
        alert("There is no workspace open.");
        return;
    }

    //clear workspace dirty flag on completion of save
    var onSave = (err,fileSaved,updatedFileMetadata) => {
        if(err) {
            alert("There was an error saving the file: " + err.toString());
        }
        else if(fileSaved) {
            var workspaceManager = app.getWorkspaceManager();
            workspaceManager.clearIsDirty();
            if(updatedFileMetadata) {
                workspaceManager.setFileMetadata(updatedFileMetadata);
            }
        }
    }

    if((!doDirectSave)||(!fileMetadata)||(!fileMetadata.directSaveOk)) {
        fileAccessObject.showFileAs(fileMetadata,workspaceText,onSave);
    }
    else {
        fileAccessObject.saveFile(fileMetadata,workspaceText,onSave);
    }
}
