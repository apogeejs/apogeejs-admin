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
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;

    if(actionResult.actionDone) {
        _fillInCommandResults(modelManager,actionResult,commandResult);
    }
    
    return commandResult;
}

/** This method fills in command results from the action results, recursively. If a command result
 * object is passed in it is populated, If one is not passed in, a new one is created.
 * The command result is returned.
 */
function _fillInCommandResults(modelManager,actionResult,commandResult) {
    if(!commandResult) commandResult = {};

    commandResult.targetId = actionResult.member.getId();
    commandResult.targetType = "component";
    commandResult.parent = modelManager;
    commandResult.action = "deleted";
    
    if(actionResult.childActionResults) {
        commandResult.childCommandResults = actionResults.childActionResults.map( actionResult => _fillInCommandResults(workspaceManager,actionResult))
    }

    return commandResult;
}

deletecomponent.commandInfo = {
    "type": "deleteComponent",
    "targetType": "component",
    "event": "deleted"
}

CommandManager.registerCommand(deletecomponent);