import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

let movecomponent = {};

//=====================================
// Action
//=====================================


/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
movecomponent.createUndoCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    var member = workspace.getMemberByFullName(commandData.memberFullName);
    var parent = member.getParent();
    var oldMemberName = member.getName();
    var oldParentFullName = parent.getFullName();
    
    var newParent = workspace.getMemberByFullName(commandData.newParentFullName);
    var newMemberFullName = newParent.getChildFullName(commandData.newMemberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = movecomponent.COMMAND_TYPE;
    undoCommandJson.memberFullName = newMemberFullName;
    undoCommandJson.newMemberName = oldMemberName;
    undoCommandJson.newParentFullName = oldParentFullName;
    
    return undoCommandJson;
}

movecomponent.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberName = commandData.memberFullName;
    actionData.targetName = commandData.newMemberName;
    actionData.targetOwnerName = commandData.newParentFullName;
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
    
}

movecomponent.COMMAND_TYPE = "moveComponent";

CommandManager.registerCommand(movecomponent);


