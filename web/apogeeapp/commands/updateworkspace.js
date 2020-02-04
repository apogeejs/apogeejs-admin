import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** Update Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"updateWorkspace",
 *   "updatedCoreProperties":(member property json), //name only
 *   "updatedAppProperties":(component property json) //currently not used
 * }
 */ 
let updateworkspace = {};

//=====================================
// Action
//=====================================

updateworkspace.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = updateworkspace.commandInfo.type;
    
    //right now we assume this is just a name update
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();
    undoCommandJson.updatedCoreProperties = {};
    undoCommandJson.updatedCoreProperties.name = model.getName();
    
    return undoCommandJson;
}

updateworkspace.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    var actionResult;    
    var actionData;
    actionData = {};
    actionData.action = "updateModel";
    actionData.model = model;
    actionData.properties = commandData.updatedCoreProperties;

    actionResult = doAction(model,actionData);

    //update any workspace manager properties here - none for now
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

updateworkspace.commandInfo = {
    "type": "updateWorkspace",
    "targetType": "workspace",
    "event": "updated"
}

CommandManager.registerCommand(updateworkspace);










