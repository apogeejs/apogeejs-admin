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

savememberdata.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    
    var actionData = getSaveDataAction(model,commandData.memberId,commandData.data);
    
    var actionResult = doAction(model,actionData);
    
    let component = modelManager.getComponentByMemberId(commandData.memberId);

    var commandResult = {};
    if((actionResult.actionDone)&&(component)) {
        commandResult.cmdDone = true;
        commandResult.target = component;
        commandResult.eventAction = "updated";
    }
    else {
        commandResult.cmdDone = false;
        let memberFullName = component ? component.getFullName(modelManager) : "<unknown>" 
        commandResult.errorMsg = "Error saving data: " + memberFullName;
    }

    commandResult.actionResult = actionResult;
    
    return commandResult;
}

savememberdata.commandInfo = {
    "type": "saveMemberData",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savememberdata);










