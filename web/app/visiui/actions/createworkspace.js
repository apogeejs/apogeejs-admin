
hax.app.visiui.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


hax.app.visiui.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        var onCreate = function(name) {
            var actionResponse = hax.app.visiui.createworkspace.createWorkspace(app,name);
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg());
            }
            return true;
        }
        
        hax.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
hax.app.visiui.createworkspace.createWorkspace = function(app,name) {
    var actionResponse = new hax.core.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make the workspace ui
        var workspaceUI = new hax.app.visiui.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
        
        //create and edd an empty workspace
        var workspace = new hax.core.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        
        var actionError = hax.core.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
