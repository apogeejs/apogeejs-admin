import util from "/apogeeutil/util.js";
import {doAction} from "/apogee/actions/action.js";

/** Save Member Description Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeDescription",
 *   "memberFullName":(main member full name),
 *   "desc":(description),
 * }
 */ 
apogeeapp.app.savememberdescription = {};

//=====================================
// Action
//=====================================

apogeeapp.app.savememberdescription.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(commandData.memberFullName);
    if(member) {
        var undoCommandJson = {};
        undoCommandJson.type = apogeeapp.app.savememberdescription.COMMAND_TYPE;
        undoCommandJson.memberFullName = commandData.memberFullName;
        undoCommandJson.description = member.getDescription();
        return undoCommandJson;
    }
    else {
        return null;
    }
}

apogeeapp.app.savememberdescription.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionData = {};
    actionData.action = "updateDescription";
    actionData.memberName = commandData.memberFullName;
    actionData.description = commandData.description ? commandData.description : "";
    
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

apogeeapp.app.savememberdescription.COMMAND_TYPE = "saveMemberDescription";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.savememberdescription);










