import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from "/apogeeapp/commands/membersave.js";


/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"compoundSaveMemberData",
 *   "memberFullName":(main member full name),
 *   "updateInfo":(member data values)
 * }
 */ 
let compoundsavememberdata = {};

//=====================================
// Action
//=====================================

compoundsavememberdata.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = compoundsavememberdata.commandInfo.type;
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    
    alert("FIX THIS! needs to be implmeneted correctly");
    return null;
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];

        let childUndoCommandJson = getMemberStateUndoCommand(model,commandData.memberFullName); 

        //OOPS. THIS ISN"T RIGHT

        actionList.push(childActionData);
    }
    
    

    
    return undoCommandJson;
}

compoundsavememberdata.executeCommand = function(workspaceManager,commandData,asynchOnComplete) {
    
    var modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];
        let data = commandData.updateEntry[1];

        let childActionData = getSaveDataAction(model,memberFullName,data,asynchOnComplete);

        actionList.push(childActionData);
    }
    
    var actionData = {};
    actionData.action = "compoundAction";
    actionData.actions = actionList;
    
    var actionResult = doAction(model,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //temporary change
    commandResult.actionResult = actionResult;
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    
    return commandResult;
}

compoundsavememberdata.commandInfo = {
    "type": "compoundSaveMemberData",
    "targetType": "component",
    "event": "created",
    "isAsynch": true
}

CommandManager.registerCommand(compoundsavememberdata);










