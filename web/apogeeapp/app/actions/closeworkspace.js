

apogeeapp.app.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.closeworkspace.getCloseCallback = function(app) {
    return function() {

        var actionResponse = apogeeapp.app.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
    }
}

//=====================================
// Action
//=====================================

apogeeapp.app.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
    
        var activeWorkspaceUI = app.getWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new apogee.ActionError(errorMsg,apogee.ActionError.ERROR_TYPE_USER,null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        if(workspace.getIsDirty()) {
            var doRemove = confirm("There is unsaved data. Are you sure you want to close the workspace?");
            if(!doRemove) {
                return actionResponse;
            }
        }
        
        workspaceUIRemoved = app.clearWorkspaceUI();
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = apogee.ActionError.processException(error,apogee.ActionError.ERROR_TYPE_APP,isFatal);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




