

apogeeapp.app.closeworkspace = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.closeworkspace.closeWorkspace = function(app) {
    
    var activeWorkspaceUI = app.getWorkspaceUI();
    if(activeWorkspaceUI === null) {
        alert("There is no workspace close.");
        return;
    }

    //update this to use undo queue, when it is finished 
    var workspace = activeWorkspaceUI.getWorkspace();
    if(workspace.getIsDirty()) {
        var doClose = confirm("There is unsaved data. Are you sure you want to close the workspace?");
        if(!doClose) {
            return;
        }
    }
    
    var command = {};
    command.cmd = () => apogeeapp.app.closeworkspace.doCloseWorkspace(app);
    //no undo
    command.desc = "Close workspace";
    
    app.executeCommand(command);
}

//=====================================
// Action
//=====================================

apogeeapp.app.closeworkspace.doCloseWorkspace = function(app) {
    var activeWorkspaceUI = app.getWorkspaceUI();
    var workspace = activeWorkspaceUI.getWorkspace();
    
    var actionResponse = new apogee.ActionResponse();
    var workspaceUIRemoved = false;
    
    try {
        
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




