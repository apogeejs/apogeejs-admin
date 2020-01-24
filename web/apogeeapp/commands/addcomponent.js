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
    
    var workspace = workspaceUI.getWorkspace();
    var memberName = commandData.memberJson.name;
    var parent = workspace.getMemberByFullName(commandData.parentFullName);
    var memberFullName = parent.getChildFullName(memberName);
    
    var undoCommandJson = {};
    undoCommandJson.type = "deleteComponent";
    undoCommandJson.memberFullName = memberFullName;
    
    return undoCommandJson;
}

addcomponent.executeCommand = function(workspaceUI,commandData) { 
    
    var workspace = workspaceUI.getWorkspace();

    //create the member
    var createAction = {};
    createAction.action = "createMember";
    createAction.ownerName = commandData.parentFullName;
    createAction.createData = commandData.memberJson;
    var actionResult = doAction(workspace,createAction);
    
    //create the components for the member
    //I need error handling for the create component action
    if(actionResult.actionDone) {
        workspaceUI.createComponentFromMember(actionResult,commandData.componentJson);
    }

    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

addcomponent.COMMAND_TYPE = "addComponent";

CommandManager.registerCommand(addcomponent);