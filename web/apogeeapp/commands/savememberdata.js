import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from  "/apogeeapp/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberId":(main member Id),
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
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberId); 
    return undoCommandJson;
}

savememberdata.executeCommand = function(workspaceManager,commandData,asynchOnComplete) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    //lookup member so we can get the component
    let member = model.lookupMember(commandData.memberId);
    
    var actionData = getSaveDataAction(model,commandData.memberId,commandData.data,asynchOnComplete);
    
    var actionResult = doAction(model,actionData);
    
    let component = modelManager.getComponentById(commandData.memberId);

    var commandResult = {};
    if((actionResult.actionDone)&&(component)) {
        commandResult.cmdDone = true;
        commandResult.target = component;
        commandResult.dispatcher = modelManager;
        commandResult.action = "updated";
    }
    else {
        commandResult.cmdDone = false;
        let memberFullName = component ? component.getFullName() : "<unknown>" 
        commandResult.errorMsg = "Error saving data: " + memberFullName;
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










