import CommandManager from "/apogeeapp/commands/CommandManager.js";

let closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE Workspace
//closeworkspace.createUndoCommand = function(workspaceManager,commandData) {

closeworkspace.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    let commandResult = {};
    commandResult.action = "deleted";
    commandResult.targetId = workspaceManager.getId();
    commandResult.targetType = workspaceManager.getTargetType();
    commandResult.parent = workspaceManager.getApp();
    
    var workspaceManagerRemoved = false;
    
    try {
        workspaceManagerRemoved = workspaceManager.getApp().clearWorkspaceManager();
        
        workspaceManager.close();
        model.onClose();

        commandResult.cmdDone = true;
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        var errorMsg = "Error closeing workspace: " + error.message;
        CommandManager.errorAlert(errorMsg,isFatal);
        
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}

closeworkspace.commandInfo = {
    "type": "closeWorkspace",
    "targetType": "workspace",
    "event": "deleted"
}

CommandManager.registerCommand(closeworkspace);




