

apogeeapp.app.closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE WORKSPACE
//apogeeapp.app.closeworkspace.createUndoCommand = function(workspaceUI,commandData) {

apogeeapp.app.closeworkspace.executeCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    
    var workspaceUIRemoved = false;
    
    try {
        
        workspaceUIRemoved = apogeeapp.app.getInstance().clearWorkspaceUI();
        
        workspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        var isFatal = !workspaceUIRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        apogeeapp.app.CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceUIRemoved;
}

apogeeapp.app.closeworkspace.COMMAND_TYPE = "closeWorkspace";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.closeworkspace);




