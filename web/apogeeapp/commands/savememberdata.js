import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from  "/apogeeapp/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberFullName":(main member full name),
 *   "data":(member data value)
 * }
 */ 
let savememberdata = {};

//=====================================
// Action
//=====================================

savememberdata.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let workspace = modelManager.getWorkspace();
    var undoCommandJson = getMemberStateUndoCommand(workspace,commandData.memberFullName); 
    return undoCommandJson;
}

savememberdata.executeCommand = function(workspaceManager,commandData,asynchOnComplete) {
    
    let modelManager = workspaceManager.getModelManager();
    let workspace = modelManager.getWorkspace();
    
    var actionData = getSaveDataAction(workspace,commandData.memberFullName,commandData.data,asynchOnComplete);
    
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;

    if(actionResult.actionDone) {
        commandResult.target = modelManager.getComponent(actionResult.member);
        commandResult.action = "updated";
    }
    
    return commandResult;
}

savememberdata.commandInfo = {
    "type": "saveMemberData",
    "targetType": "component",
    "event": "updated",
    "isAsynch": true
}

CommandManager.registerCommand(savememberdata);










