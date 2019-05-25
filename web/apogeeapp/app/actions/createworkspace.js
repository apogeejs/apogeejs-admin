
apogeeapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


apogeeapp.app.createworkspace.createWorkspace = function(app) {
    //make sure there is not an open workspace
    if(app.getWorkspaceUI()) {
        alert("There is already an open workspace. You must close the workspace first.");
        return;
    }      
    
    var command = {};
    command.cmd = () => apogeeapp.app.createworkspace.doCreateWorkspace(app);
    //no undo
    command.desc = "Create workspace";
    
    app.executeCommand(command);
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
apogeeapp.app.createworkspace.doCreateWorkspace = function(app) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIAdded;
    
    try {
        
        //make the workspace ui
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
        
        //load
        workspaceUI.load();
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
