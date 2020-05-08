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

    workspaceManager.getApp().clearWorkspaceManager();
    workspaceManager.close();
    model.onClose(model);
}

closeworkspace.commandInfo = {
    "type": "closeWorkspace",
    "targetType": "workspace",
    "event": "deleted"
}

CommandManager.registerCommand(closeworkspace);




