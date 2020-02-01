import CommandManager from "/apogeeapp/commands/CommandManager.js";

let closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE WORKSPACE
//closeworkspace.createUndoCommand = function(workspaceUI,commandData) {

closeworkspace.executeCommand = function(workspaceUI,commandData) {
    let modelManager = workspaceUI.getModelManager();
    var workspace = modelManager.getWorkspace();
    
    var workspaceUIRemoved = false;
    
    try {
        workspaceUIRemoved = workspaceUI.getApp().clearWorkspaceUI();
        
        workspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        var isFatal = !workspaceUIRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceUIRemoved;
}

closeworkspace.commandInfo = {
    "type": "closeWorkspace",
    "targetType": "workspace",
    "event": "deleted"
}

CommandManager.registerCommand(closeworkspace);




