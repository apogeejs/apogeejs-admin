
//=====================================
// UI Entry Point
//=====================================

/** This is the UI sequence to open a workspace */
export function openWorkspace(app,fileAccessObject) {
    
    //make sure there is not an open workspace
    if(app.getWorkspaceManager()) {
        alert("There is an open workspace. You must close the workspace first.");
        return;
    }    

    let onOpen = (err,workspaceData,fileMetadata) => onWorkspaceOpen(err,app,workspaceData,fileMetadata);

    fileAccessObject.openFile(onOpen);
}

//=====================================
// Internal functions
//=====================================

/** This method should be called when workspace data is opened, to create the workspace. */
function onWorkspaceOpen(err,app,workspaceData,fileMetadata) {

    if(err) {
        var errorMessage = "There was an error opening the file";
        if(err.message)errorMessage += ": " + err.message;
        alert(errorMessage);
        return;
    }
    else if(workspaceData) {
        if(app.getWorkspaceManager()) {
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
        commandData.type = "openWorkspace";
        commandData.workspaceJson = workspaceJson;
        commandData.fileMetadata = fileMetadata;

        app.executeCommand(commandData);
    }
}
