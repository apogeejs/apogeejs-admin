import CommandManager from "/apogeeapp/commands/CommandManager.js";

let closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE Workspace
//closeworkspace.createUndoCommand = function(workspaceManager,commandData) {

closeworkspace.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    
    var workspaceManagerRemoved = false;
    
    try {
        workspaceManagerRemoved = workspaceManager.getApp().clearWorkspaceManager();
        
        workspaceManager.close();
        model.onClose();
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        var isFatal = !workspaceManagerRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceManagerRemoved;
}

closeworkspace.commandInfo = {
    "type": "closeWorkspace",
    "targetType": "workspace",
    "event": "deleted"
}

CommandManager.registerCommand(closeworkspace);




