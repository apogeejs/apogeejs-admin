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
    let model = modelManager.getModel();

    //look up id so we can look up component
    let member = model.getMemberByFullName(commandData.memberFullName);
    let memberId = member.getId();

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberName = commandData.memberFullName;
    actionData.targetName = commandData.newMemberName;
    actionData.targetOwnerName = commandData.newParentFullName;
    let actionResult = doAction(model,actionData);
    
    let commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(commandResult.cmdDone) {
        commandResult.target = modelManager.getComponentById(memberId);
        commandResult.dispatcher = modelManager;
    }
    else {
        commandResult.errorMsg = "Error moving component: " + actionData.memberName;
    }
    commandResult.actionResult = actionResult;
    
    return commandResult;
    
}

movecomponent.commandInfo = {
    "type": "moveComponent",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(movecomponent);


