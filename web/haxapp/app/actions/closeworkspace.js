

haxapp.app.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

haxapp.app.closeworkspace.getCloseCallback = function(app) {
    return function() {

        var actionResponse = haxapp.app.closeworkspace.closeWorkspace(app); 
        if(!actionResponse.getSuccess()) {
            alert(actionResponse.getErrorMsg());
        }
    }
}

//=====================================
// Action
//=====================================

haxapp.app.closeworkspace.closeWorkspace = function(app) {
    var actionResponse = new hax.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
    
        var activeWorkspaceUI = app.getActiveWorkspaceUI();
        if(activeWorkspaceUI === null) {
            var errorMsg = "There is no workspace open.";
            var actionError = new hax.ActionError(errorMsg,"User",null);
            actionResponse.addError(actionError);
            return actionResponse;
        }

        var workspace = activeWorkspaceUI.getWorkspace();
        
        var name = workspace.getName();
        
        var doRemove = confirm("Are you sure you want to close the workspace " + name + "?");
        if(!doRemove) {
            return actionResponse;
        }
        
        workspaceUIRemoved = app.removeWorkspaceUI(name);
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var actionError = hax.ActionError.processException(error,"AppException",isFatal);
        actionResponse.addError(actionError);
    }
    
    return actionResponse;
}




