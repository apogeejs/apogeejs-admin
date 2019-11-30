
//=====================================
// UI Entry Point
//=====================================

/** This is the UI sequence to open a workspace */
export function openWorkspace(app,fileAccessObject) {
    
    //make sure there is not an open workspace
    if(app.getWorkspaceUI()) {
        alert("There is an open workspace. You must close the workspace first.");
        return;
    }    

    fileAccessObject.openFile(app,onOpen);
}

//=====================================
// non-UI Entry Point
//=====================================

/** This opens a workspace directly from file data, not using the UI file selector. */
export function openWorkspaceFromTextData(app,workspaceTextData,workspaceMetadata) {

    //make sure there is not an open workspace
    if(app.getWorkspaceUI()) {
        alert("There is an open workspace. You must close the workspace first.");
        return;
    }    

    onOpen(null,app,workspaceTextData,workspaceMetadata);
}

//=====================================
// Internal functions
//=====================================

/** This method should be called when workspace data is opened, to create the workspace. */
function onOpen(err,app,workspaceData,fileMetadata) {

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
        commandData.type = "openWorkspace";
        commandData.workspaceJson = workspaceJson;
        commandData.fileMetadata = fileMetadata;

        app.executeCommand(commandData);
    }
}
