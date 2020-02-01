//import base from "/apogeeutil/base.js";
import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";


/** Add Component Command
 *
 * Command JSON format:
 * {
 *   "type":"addComponent",
 *   "parentFullName":(parent full name),
 *   "memberJson":(member property json),
 *   "componentJson":(component property json)
 * }
 */ 

let addcomponent = {};

//=====================================
// Command Object
//=====================================

addcomponent.createUndoCommand = function(workspaceUI,commandData) {
    
    var modelManager = workspaceUI.getModelManager();
    var workspace = modelManager.getWorkspace();
    var memberName = commandData.memberJson.name;
    var parent = workspace.getMemberByFullName(commandData.parentFullName);
    var memberFullName = parent.getChildFullName(memberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = "deleteComponent";
    undoCommandJson.memberFullName = memberFullName;
    
    return undoCommandJson;
}

addcomponent.executeCommand = function(workspaceUI,commandData) { 
    
    let modelManager = workspaceUI.getModelManager();
    let workspace = modelManager.getWorkspace();
    let commandResult;

    //create the member
    let createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = commandData.parentFullName;
    createAction.createData = commandData.memberJson;
    let actionResult = doAction(workspace,createAction);
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        commandResult = modelManager.createComponentFromMember(actionResult,commandData.componentJson);
    }
    else {
        commandResult = {};
    }

    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

addcomponent.commandInfo = {
    "type": "addComponent",
    "targetType": "component",
    "event": "created"
}

CommandManager.registerCommand(addcomponent);