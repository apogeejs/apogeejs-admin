
//=====================================
// UI Entry Point
//=====================================

export function createWorkspace(app) {
    //make sure there is not an open workspace
    if(app.getWorkspaceManager()) {
        alert("There is already an open workspace. You must close the workspace first.");
        return;
    }      
    
    var commandData = {};
    commandData.type = "openWorkspace";
    
    app.executeCommand(commandData);
}
