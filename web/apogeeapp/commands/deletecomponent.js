import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

let deletecomponent = {};

//=====================================
// Command Object
//=====================================

/*** 
 * This command supports two formats:
 * 
 * Format 1: member ID
 * commandData.type = "deleteComponent"
 * commandData.memberId = (memberId)
 * 
 * Format 2: parent ID, memberName
 * commandData.type = "deleteComponent"
 * commandData.parentId = (parentId)
 * commandData.memberName = (memberName)
 */
deletecomponent.createUndoCommand = function(workspaceManager,commandData) {
    
    //problems
    // - is this member a component main member?
    // - is there a parent, or just an owner
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    let member;
    let component;
    let parent;

    if(commandData.memberId) {
        member = model.lookupMember(commandData.memberId);
        parent = member.getParent();
    }
    else {
        parent = model.lookupMember(commandData.parentId);
        member = parent.lookupMember(commandData.memberName);
    }
    component = modelManager.getComponent(member);
    
    var commandUndoJson = {};
    commandUndoJson.type = "addComponent";
    commandUndoJson.parentId = parent.getId();
    commandUndoJson.memberJson = member.toJson();
    commandUndoJson.componentJson = component.toJson();
    
    return commandUndoJson;
}

/** This method deletes the component and the underlying member. It should be passed
 *  the model and the member full name. (We delete by name and model to handle
 *  undo/redo cases where the instance of the member changes.)
 */
deletecomponent.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();

    var actionJson = {};
    actionJson.action = "deleteMember";

    if(commandData.memberId) {
        actionJson.memberId = commandData.memberId;
    }
    else {
        let parent = model.lookupMember(commandData.parentId);
        let member = parent.lookupMember(commandData.memberName);
        actionJson.memberId = member.getId();
    }
    
    var actionResult = doAction(model,actionJson);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;

    commandResult.actionResult = actionResult;
    
    return commandResult;
}

deletecomponent.commandInfo = {
    "type": "deleteComponent",
    "targetType": "component",
    "event": "deleted"
}

CommandManager.registerCommand(deletecomponent);