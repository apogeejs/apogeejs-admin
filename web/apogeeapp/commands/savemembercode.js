import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSetCodeAction, getMemberStateUndoCommand} from  "/apogeeapp/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberId":(main member ID),
 *   "argList":(argument list json array),
 *   "functionBody":(function body)
 *   "supplementalCode":(supplementalCode code - optional)
 *   "clearCodeDataValue":(value to set data is code cleared - optional)
 * }
 */ 
let savemembercode = {};

//=====================================
// Action
//=====================================

savemembercode.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    var undoCommandJson = getMemberStateUndoCommand(model,commandData.memberId); 
    return undoCommandJson;
}

savemembercode.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    
    var actionData = getSetCodeAction(model,
        commandData.memberId,
        commandData.argList,
        commandData.functionBody,
        commandData.supplementalCode,
        commandData.clearCodeDataValue);
    
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

savemembercode.commandInfo = {
    "type": "saveMemberCode",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savemembercode);










