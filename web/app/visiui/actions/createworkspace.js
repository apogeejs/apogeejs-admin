
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
    
    try {
        //make the workspace ui
        var workspaceUI = new visicomp.app.visiui.WorkspaceUI();
        app.addWorkspaceUI(workspaceUI,name);
        
        //create and edd an empty workspace
        var workspace = new visicomp.core.Workspace(name);
        workspaceUI.setWorkspace(workspace);
    
        actionResponse.workspaceUI = workspaceUI;
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse; 
}
