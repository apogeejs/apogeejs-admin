import {doAction} from "/apogee/actions/action.js";

import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

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

updateworkspace.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = updateworkspace.COMMAND_TYPE;
    
    //right now we assume this is just a name update
    var workspace = workspaceUI.getWorkspace();
    undoCommandJson.updatedCoreProperties = {};
    undoCommandJson.updatedCoreProperties.name = workspace.getName();
    
    return undoCommandJson;
}

updateworkspace.executeCommand = function(workspaceUI,commandData) {
    
    var workspace = workspaceUI.getWorkspace();

    var actionResult;    
    var actionData;
    actionData = {};
    actionData.action = "updateWorkspace";
    actionData.workspace = workspace;
    actionData.properties = commandData.updatedCoreProperties;

    actionResult = doAction(workspace,actionData);

    //update any workspace ui properties here - none for now
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

updateworkspace.COMMAND_TYPE = "updateWorkspace";

CommandManager.registerCommand(updateworkspace);










