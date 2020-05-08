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
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();

    //create the member
    let createAction = {};
    createAction.action = "createMember";
    createAction.parentId = commandData.parentId;
    createAction.createData = commandData.memberJson;
    let actionResult = doAction(model,createAction);
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        //this is a bit clumsy...
        let parentMember = model.lookupMemberById(commandData.parentId);
        let name = commandData.memberJson.name
        let componentMember = parentMember.lookupChild(model,name);
        modelManager.createComponentFromMember(componentMember,commandData.componentJson);
    }
    else {
        throw new Error("Failure creating member: " + actionResult.errorMsg);
    }
}

addcomponent.commandInfo = {
    "type": "addComponent",
    "targetType": "component",
    "event": "created"
}

CommandManager.registerCommand(addcomponent);