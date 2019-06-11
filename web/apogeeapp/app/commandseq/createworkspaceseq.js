
apogeeapp.app.createworkspaceseq = {};

//=====================================
// UI Entry Point
//=====================================


apogeeapp.app.createworkspaceseq.createWorkspace = function(app) {
    //make sure there is not an open workspace
    if(app.getWorkspaceUI()) {
        alert("There is already an open workspace. You must close the workspace first.");
        return;
    }      
    
    var command = apogeeapp.app.createworkspace.createCreateWorkspaceCommand(app);
    
    app.executeCommand(command);
}
