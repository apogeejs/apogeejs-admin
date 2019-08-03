import util from "/apogeeutil/util.js";

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
apogeeapp.app.savemembercode = {};

//=====================================
// Action
//=====================================

apogeeapp.app.savemembercode.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var undoCommandJson = apogeeapp.app.membersave.getMemberStateUndoCommand(workspace,commandData.memberFullName); 
    return undoCommandJson;
}

apogeeapp.app.savemembercode.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = apogeeapp.app.membersave.getSetCodeAction(workspace,
        commandData.memberFullName,
        commandData.argList,
        commandData.functionBody,
        commandData.supplementalCode,
        commandData.clearCodeDataValue);
    
    var actionResult = action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savemembercode.COMMAND_TYPE = "saveMemberCode";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savemembercode);










