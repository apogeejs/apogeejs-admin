

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

    //
    if(activeWorkspaceUI.getIsDirty()) {
        var doClose = confirm("There is unsaved data. Are you sure you want to close the workspace?");
        if(!doClose) {
            return;
        }
    }
    
    var commandJson = {};
    commandJson.type = apogeeapp.app.closeworkspace.COMMAND_TYPE;

    app.executeCommand(commandJson);
}

