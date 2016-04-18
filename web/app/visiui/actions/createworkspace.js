
visicomp.app.visiui.createworkspace = {};

//=====================================
// UI Entry Point
//=====================================


visicomp.app.visiui.createworkspace.getCreateCallback = function(app) {
    return function() {
        
        var onCreate = function(name) {
            var actionResponse = visicomp.app.visiui.createworkspace.createWorkspace(app,name);
            if(!actionResponse.getSuccess()) {
                alert(actionResponse.getErrorMsg());
            }
            return true;
        }
        
        visicomp.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
    }
}

//=====================================
// Action
//=====================================

/** This method creates a new workspace. */
visicomp.app.visiui.createworkspace.createWorkspace = function(app,name) {
    var actionResponse = new visicomp.core.ActionResponse();
    var workspaceUIAdded;
    
    try {
        //make the workspace ui
        var workspaceUI = new visicomp.app.visiui.WorkspaceUI();
        workspaceUIAdded = app.addWorkspaceUI(workspaceUI,name);
        
        //create and edd an empty workspace
        var workspace = new visicomp.core.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) { 
        if(workspaceUIAdded) {
            app.removeWorkspaceUI(name);
        }
        
        var actionError = visicomp.core.ActionError.processException(error,"AppException",false);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
