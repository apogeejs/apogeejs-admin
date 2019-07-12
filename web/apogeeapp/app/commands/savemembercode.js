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

apogeeapp.app.savemembercode.createUndoCommand = function(workspaceUI,commandJson) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.savemembercode.COMMAND_TYPE;
    
    var workspace = workspaceUI.getWorkspace();
    
    return undoCommandJson;
}

apogeeapp.app.savemembercode.executeCommand = function(workspaceUI,commandJson,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = apogeeapp.app.membersave.getSetCodeAction(workspace,
        commandJson.memberFullName,
        commandJson.argList,
        commandJson.functionBody
        commandJson.supplementalCode
        commandJson.clearCodeDataValue);
    
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savemembercode.COMMAND_TYPE = "saveMemberCode";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savemembercode);










