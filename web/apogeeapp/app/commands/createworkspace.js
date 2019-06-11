
apogeeapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


apogeeapp.app.createworkspace.createCreateWorkspaceCommand = function(app) {
    var command = {};
    command.cmd = () => apogeeapp.app.createworkspace.doCreateWorkspace(app);
    //no undo
    command.desc = "Create workspace";
    
    return command;
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
apogeeapp.app.createworkspace.doCreateWorkspace = function(app) {
    var workspaceUIAdded;
    
    try {
        
        //make the workspace ui
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
        
        //load
        workspaceUI.load();
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        var errorMsg = "Error opening workspace: " + error.message;
        apogeeapp.app.CommandManager.errorAlert(errorMsg);
    }
    
    return workspaceUIAdded; 
}
