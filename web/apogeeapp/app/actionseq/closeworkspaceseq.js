

apogeeapp.app.closeworkspaceseq = {};

//=====================================
// UI Entry Point
//=====================================

apogeeapp.app.closeworkspaceseq.closeWorkspace = function(app) {
    
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
    
    var command = apogeeapp.app.closeworkspace.createCloseWorkspaceCommand(app);
    
    app.executeCommand(command);
}

