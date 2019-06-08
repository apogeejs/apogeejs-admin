

apogeeapp.app.closeworkspace = {};

//=====================================
// Action
//=====================================

apogeeapp.app.closeworkspace.createCloseWorkspaceCommand = function(app) {
    var command = {};
    command.cmd = () => apogeeapp.app.closeworkspace.doCloseWorkspace(app);
    //no undo
    command.desc = "Close workspace";
    
    return command;
}

apogeeapp.app.closeworkspace.doCloseWorkspace = function(app) {
    var activeWorkspaceUI = app.getWorkspaceUI();
    var workspace = activeWorkspaceUI.getWorkspace();
    
    var workspaceUIRemoved = false;
    
    try {
        
        workspaceUIRemoved = app.clearWorkspaceUI();
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        apogeeapp.app.CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceUIRemoved;
}




