
apogeeapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


apogeeapp.app.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            alert("There is already an open workspace. You must close the workspace first.");
        }      

        var actionResponse = apogeeapp.app.createworkspace.createWorkspace(app);
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
apogeeapp.app.createworkspace.createWorkspace = function(app) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make sure there is not an open workspace
        if(app.getWorkspaceUI()) {
            throw new Error("There is already an open workspace");
        }
        
        //make the workspace ui
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
        
        //create and edd an empty workspace
        var workspace = new apogee.Workspace();
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        var actionError = apogee.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
