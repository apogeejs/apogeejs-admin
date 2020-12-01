import {closeWorkspace} from "/apogeeview/commandseq/closeworkspaceseq.js";

//=====================================
// UI Entry Point
//=====================================

/** This is the UI sequence to open a workspace */
export function openWorkspace(app,fileAccessObject) {
    let onOpen = (err,workspaceData,fileMetadata) => onWorkspaceOpen(err,app,workspaceData,fileMetadata);

    let doOpen = () => fileAccessObject.openFile(onOpen);

    //If there is an open workspace, close first
    if(app.getWorkspaceManager()) {
        closeWorkspace(app,doOpen);
    }    
    else {
        doOpen();
    }
}

//=====================================
// Internal functions
//=====================================

/** This method should be called when workspace data is opened, to create the workspace. */
function onWorkspaceOpen(err,app,workspaceData,fileMetadata) {

    if(err) {
        var errorMessage = "There was an error opening the file";
        if(err.message)errorMessage += ": " + err.message;
        apogeeUserAlert(errorMessage);
        return;
    }
    else if(workspaceData) {
        if(app.getWorkspaceManager()) {
            apogeeUserAlert("There is already an open workspace");
            return;
        }
        
        var workspaceJson;
        try {
            workspaceJson = JSON.parse(workspaceData);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            
            apogeeUserAlert("Error parsing workspace content: " + error.message);
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
