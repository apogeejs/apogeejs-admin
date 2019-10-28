import {doAction} from "/apogee/actions/action.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from  "/apogeeapp/app/commands/membersave.js";


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

savememberdata.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var undoCommandJson = getMemberStateUndoCommand(workspace,commandData.memberFullName); 
    return undoCommandJson;
}

savememberdata.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = getSaveDataAction(workspace,commandData.memberFullName,commandData.data,asynchOnComplete);
    
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

savememberdata.COMMAND_TYPE = "saveMemberData";

savememberdata.isAsynch = true;

CommandManager.registerCommand(savememberdata);










