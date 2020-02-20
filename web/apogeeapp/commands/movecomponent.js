import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

let movecomponent = {};

//=====================================
// Action
//=====================================


/** This creates the command. Both the initial and full names should be passed in 
 * even is they are the same. */
movecomponent.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    var member = model.getMemberByFullName(commandData.memberFullName);
    var parent = member.getParent();
    var oldMemberName = member.getName();
    var oldParentFullName = parent.getFullName();
    
    var newParent = model.getMemberByFullName(commandData.newParentFullName);
    var newMemberFullName = newParent.getChildFullName(commandData.newMemberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = movecomponent.commandInfo.type;
    undoCommandJson.memberFullName = newMemberFullName;
    undoCommandJson.newMemberName = oldMemberName;
    undoCommandJson.newParentFullName = oldParentFullName;
    
    return undoCommandJson;
}

movecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberName = commandData.memberFullName;
    actionData.targetName = commandData.newMemberName;
    actionData.targetOwnerName = commandData.newParentFullName;
    var actionResult = doAction(model,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    if(actionResult.actionDone) {
        let parentMember = model.getMemberByFullName(command.newParentFullName)
        let member = parentMember.lookupChild(commandData.newMemberName);
        commandResult.target = modelManager.getComponent(member);
        commandResult.action = "updated";
    }
    
    return commandResult;
    
}

movecomponent.commandInfo = {
    "type": "moveComponent",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(movecomponent);


