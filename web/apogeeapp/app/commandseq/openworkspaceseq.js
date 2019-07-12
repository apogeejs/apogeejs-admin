
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
        
        var workspaceJson;
        try {
            workspaceJson = JSON.parse(workspaceData);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            
            alert("Error parsing workspace content: " + error.message);
            return;
        }
        
        //open workspace
        var commandData = {};
        commandData.type = apogeeapp.app.openworkspace.COMMAND_TYPE;
        commandData.workspaceJson = workspaceJson;
        commandData.fileMetadata = fileMetadata;

        app.executeCommand(commandData);
    }
}
