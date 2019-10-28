

//=====================================
// UI Entry Point
//=====================================

export function closeWorkspace(app) {
    
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
    
    var commandData = {};
    commandData.type = "closeWorkspace";

    app.executeCommand(commandData);
}

