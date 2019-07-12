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

apogeeapp.app.savememberdata.createUndoCommand = function(workspaceUI,commandJson) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.savememberdata.COMMAND_TYPE;
    
    var workspace = workspaceUI.getWorkspace();

    
    return undoCommandJson;
}

apogeeapp.app.savememberdata.executeCommand = function(workspaceUI,commandJson,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    var actionData = apogeeapp.app.membersave.getSaveDataAction(workspace,commandJson.memberFullName,commandJson.data);
    
    //handle the asynch case
    if((commandJson.data instanceof Promise)&&(asynchOnComplete)) {
        //add a promise callback if this is a promise, to handle any alert
        actionData.promiseCallback = asynchActionResult => {
            var asynchCommandResult = {};
            asynchCommandResult.cmdDone = asynchActionResult.actionDone;
            if(asynchActionResult.alertMsg) asynchCommandResult.alertMsg = asynchActionResult.alertMsg;
            
            asynchOnComplete(asynchCommandResult);
        }
    }
    
    var actionResult = apogee.action.doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savememberdata.COMMAND_TYPE = "saveMemberData";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savememberdata);










