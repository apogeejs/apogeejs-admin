/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeData",
 *   "memberFullName":(main member full name),
 *   "desc":(description),
 * }
 */ 
apogeeapp.app.savememberdescription = {};

//=====================================
// Action
//=====================================

apogeeapp.app.savememberdescription.createUndoCommand = function(workspaceUI,commandJson) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.lookupMemberByFullName(commandJson.memberFullName);
    if(member) {
        var undoCommandJson = {};
        undoCommandJson.type = apogeeapp.app.savememberdescription.COMMAND_TYPE;
        undoCommandJson.memberFullName = commandJson.memberFullName;
        undoCommandJson.description = member.getDescription();
        return undoCommandJson;
    }
    else {
        return null;
    }
}

apogeeapp.app.savememberdescription.executeCommand = function(workspaceUI,commandJson) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionData = {};
    actionData.action = apogee.updatemember.UPDATE_DESCRIPTION_ACTION_NAME;
    actionData.memberName = commandJson.memberFullName;
    actionData.description = commandJson.text ? commandJson.text : "";
    
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savememberdescription.COMMAND_TYPE = "saveMemberDescription";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savememberdescription);










