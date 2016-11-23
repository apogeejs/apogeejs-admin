
haxapp.app.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


haxapp.app.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        var onCreate = function(name) {
            var actionResponse = haxapp.app.createworkspace.createWorkspace(app,name);
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg());
            }
            return true;
        }
        
        haxapp.app.dialog.showCreateWorkspaceDialog(onCreate); 
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
haxapp.app.createworkspace.createWorkspace = function(app,name) {
    var actionResponse = new hax.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make the workspace ui
        var workspaceUI = new haxapp.app.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
        
        //create and edd an empty workspace
        var workspace = new hax.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        
        var actionError = hax.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
