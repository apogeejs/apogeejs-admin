import {doAction} from "/apogee/actions/action.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberFullName":(main member full name),
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

savemembercode.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var undoCommandJson = apogeeapp.app.membersave.getMemberStateUndoCommand(workspace,commandData.memberFullName); 
    return undoCommandJson;
}

savemembercode.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = apogeeapp.app.membersave.getSetCodeAction(workspace,
        commandData.memberFullName,
        commandData.argList,
        commandData.functionBody,
        commandData.supplementalCode,
        commandData.clearCodeDataValue);
    
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

savemembercode.COMMAND_TYPE = "saveMemberCode";

CommandManager.registerCommand(savemembercode);










