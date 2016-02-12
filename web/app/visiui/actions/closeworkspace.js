

visicomp.app.visiui.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.closeworkspace.getCloseCallback = function(app) {
    return function() {
        
        //we should have a warning! And better yet, check for a dirty flag
        
        var actionResponse = visicomp.app.visiui.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

visicomp.app.visiui.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new visicomp.core.ActionResponse();
    
    try {
    
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.ActionError.ACTION_ERROR_USER);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        app.removeWorkspaceUI(activeWorkspaceUI);

        var workspace = activeWorkspaceUI.getWorkspace();
        workspace.close();
    }
    catch(error) {
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




