//import base from "/apogeeutil/base.js";
import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";


/** Add Component Command
 *
 * Command JSON format:
 * {
 *   "type":"addComponent",
 *   "parentId":(parent ID),
 *   "memberJson":(member property json),
 *   "componentJson":(component property json)
 * }
 */ 

let addcomponent = {};

//=====================================
// Command Object
//=====================================

addcomponent.createUndoCommand = function(workspaceManager,commandData) {
    
    var undoCommandJson = {};
    undoCommandJson.type = "deleteComponent";
    undoCommandJson.parentId = commandData.parentId;
    undoCommandJson.memberName = commandData.memberJson.name;
    
    return undoCommandJson;
}

addcomponent.executeCommand = function(workspaceManager,commandData) { 
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    let commandResult;

    //create the member
    let createAction = {};
    createAction.action = "createMember";
    createAction.ownerId = commandData.parentId;
    createAction.createData = commandData.memberJson;
    let actionResult = doAction(model,createAction);
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        //this is a bit clumsy...
        let parentMember = model.lookupMember(commandData.parentId);
        let name = commandData.memberJson.name
        let componentMember = parentMember.lookupChild(name);
        commandResult = modelManager.createComponentFromMember(componentMember,commandData.componentJson);
    }
    else {
        commandResult = {};
        commandResult.cmdDone = false;
        commandResult.errorMsg = "Create member failed";
    }
    
    //store the model level result
    commandResult.actionResult = actionResult;

    return commandResult;
}

addcomponent.commandInfo = {
    "type": "addComponent",
    "targetType": "component",
    "event": "created"
}

CommandManager.registerCommand(addcomponent);