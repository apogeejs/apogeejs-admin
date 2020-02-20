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

addcomponent.createUndoCommand = function(workspaceManager,commandData) {
    
    var modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    var memberName = commandData.memberJson.name;
    var parent = model.getMemberByFullName(commandData.parentFullName);
    var memberFullName = parent.getChildFullName(memberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = "deleteComponent";
    undoCommandJson.memberFullName = memberFullName;
    
    return undoCommandJson;
}

addcomponent.executeCommand = function(workspaceManager,commandData) { 
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    let commandResult;

    //create the member
    let createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = commandData.parentFullName;
    createAction.createData = commandData.memberJson;
    let actionResult = doAction(model,createAction);
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        //this is a bit clumsy...
        let parentMember = model.getMemberByFullName(commandData.parentFullName);
        let name = commandData.memberJson.name
        let componentMember = parentMember.lookupChild(name);
        commandResult = modelManager.createComponentFromMember(componentMember,commandData.componentJson);
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