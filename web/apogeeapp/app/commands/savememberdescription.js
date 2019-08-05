import {doAction} from "/apogee/actions/action.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

/** Save Member Description Command
 *
 * Command JSON format:
 * {
 *   "type":"saveMembeDescription",
 *   "memberFullName":(main member full name),
 *   "desc":(description),
 * }
 */ 
let savememberdescription = {};

//=====================================
// Action
//=====================================

savememberdescription.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(commandData.memberFullName);
    if(member) {
        var undoCommandJson = {};
        undoCommandJson.type = savememberdescription.COMMAND_TYPE;
        undoCommandJson.memberFullName = commandData.memberFullName;
        undoCommandJson.description = member.getDescription();
        return undoCommandJson;
    }
    else {
        return null;
    }
}

savememberdescription.executeCommand = function(workspaceUI,commandData) {
    
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

savememberdescription.COMMAND_TYPE = "saveMemberDescription";

CommandManager.registerCommand(savememberdescription);










