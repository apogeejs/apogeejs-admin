

apogeeapp.app.closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE WORKSPACE
//apogeeapp.app.closeworkspace.createUndoCommand = function(workspaceUI,commandJson) {

apogeeapp.app.closeworkspace.executeCommand = function(workspaceUI,commandJson)
    var workspace = workspaceUI.getWorkspace();
    
    var workspaceUIRemoved = false;
    
    try {
        
        workspaceUIRemoved = app.clearWorkspaceUI();
        
        activeWorkspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        var isFatal = !workspaceUIRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        apogeeapp.app.CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceUIRemoved;
}

apogeeapp.app.closeworkspace.COMMAND_TYPE = "closeWorkspace";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.closeworkspace);




