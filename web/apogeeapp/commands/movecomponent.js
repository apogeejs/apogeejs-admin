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
    var member = model.lookupMemberById(commandData.memberId);
    var parent = member.getParent(model);
    var oldMemberName = member.getName();
    
    var undoCommandJson = {};
    undoCommandJson.type = movecomponent.commandInfo.type;
    undoCommandJson.memberId = commandData.memberId;
    undoCommandJson.newMemberName = oldMemberName;
    undoCommandJson.newParentId = parent.getId();
    
    return undoCommandJson;
}

movecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();

    var actionData = {};
    actionData.action = "moveMember";
    actionData.memberId = commandData.memberId;
    actionData.targetName = commandData.newMemberName;
    actionData.targetParentId = commandData.newParentId;
    let actionResult = doAction(model,actionData);

    let componentId = modelManager.getComponentIdByMemberId(commandData.memberId);
    let component = modelManager.getComponentByComponentId(componentId);
    
    let commandResult = {};
    if((actionResult.actionDone)&&(component)) {
        commandResult.cmdDone = true;
        commandResult.eventAction = "updated";
        commandResult.target = component;
    }
    else {
        commandResult.cmdDone = false;
        let name = component ? component.getFullName(modelManager) : "unknown";
        commandResult.errorMsg = "Error moving component: " + name;
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


