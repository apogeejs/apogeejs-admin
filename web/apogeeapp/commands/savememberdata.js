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
    let model = modelManager.getModel();
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberFullName); 
    return undoCommandJson;
}

savememberdata.executeCommand = function(workspaceManager,commandData,asynchOnComplete) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    //lookup member so we can get the component
    let member = model.getMemberByFullName(commandData.memberFullName);
    
    var actionData = getSaveDataAction(model,commandData.memberFullName,commandData.data,asynchOnComplete);
    
    var actionResult = doAction(model,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(commandResult.cmdDone) {
        commandResult.target = modelManager.getComponent(modelManager.getComponent(member));
        commandResult.dispatcher = modelManager;
        commandResult.action = "updated";
    }
    else {
        commandResult.errorMsg = "Error saving data: " + commandData.memberFullName;
    }

    commandResult.actionResult = actionResult;
    
    return commandResult;
}

savememberdata.commandInfo = {
    "type": "saveMemberData",
    "targetType": "component",
    "event": "updated",
    "isAsynch": true
}

CommandManager.registerCommand(savememberdata);










