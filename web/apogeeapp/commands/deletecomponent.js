import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

let deletecomponent = {};

//=====================================
// Command Object
//=====================================

deletecomponent.createUndoCommand = function(workspaceManager,commandData) {
    
    //problems
    // - is this member a component main member?
    // - is there a parent, or just an owner
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    var member = model.getMemberByFullName(commandData.memberFullName);
    var component = modelManager.getComponent(member);
    var parent = member.getParent();
    
    var commandUndoJson = {};
    commandUndoJson.type = "addComponent";
    commandUndoJson.parentFullName = parent.getFullName();
    commandUndoJson.memberJson = member.toJson();
    commandUndoJson.componentJson = component.toJson();
    
    return commandUndoJson;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the model and the member full name. (We delete by name and model to handle
 *  undo/redo cases where the instance of the member changes.)
 */
deletecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();

    var actionJson = {};
    actionJson.action = "deleteMember";
    actionJson.memberName = commandData.memberFullName;
    
    var actionResult = doAction(model,actionJson);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;

    commandResult.actionResult = actionResult;
    
    return commandResult;
}

deletecomponent.commandInfo = {
    "type": "deleteComponent",
    "targetType": "component",
    "event": "deleted"
}

CommandManager.registerCommand(deletecomponent);