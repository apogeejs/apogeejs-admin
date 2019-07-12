/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberFullName":(main member full name),
 *   "data":(member data value)
 * }
 */ 
apogeeapp.app.savememberdata = {};

//=====================================
// Action
//=====================================

apogeeapp.app.savememberdata.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var undoCommandJson = apogeeapp.app.membersave.getMemberStateUndoCommand(workspace,commandData.memberFullName); 
    return undoCommandJson;
}

apogeeapp.app.savememberdata.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = apogeeapp.app.membersave.getSaveDataAction(workspace,commandData.memberFullName,commandData.data,asynchOnComplete);
    
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savememberdata.COMMAND_TYPE = "saveMemberData";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savememberdata);










