
apogeeapp.app.openworkspaceseq = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.openworkspaceseq.openWorkspace = function(app,fileAccessObject) {
    
    //make sure there is not an open workspace
    if(app.getWorkspaceUI()) {
        alert("There is an open workspace. You must close the workspace first.");
        return;
    }    

    fileAccessObject.openFile(app,apogeeapp.app.openworkspaceseq.onOpen);
}

/** This method should be called when workspace data is opened, to create the workspace. */
apogeeapp.app.openworkspaceseq.onOpen = function(err,app,workspaceData,fileMetadata) {

    if(err) {
        var errorMessage = "There was an error opening the file";
        if(err.message)errorMessage += ": " + err.message;
        alert(errorMessage);
        return;
    }
    else {
        if(app.getWorkspaceUI()) {
            alert("There is already an open workspace");
            return;
        }
        
        //open workspace
        var command = apogeeapp.app.openworkspace.createOpenWorkspaceCommand(app,workspaceData,fileMetadata);

        app.executeCommand(command);
    }
}
