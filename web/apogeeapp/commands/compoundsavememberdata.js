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

compoundsavememberdata.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = compoundsavememberdata.COMMAND_TYPE;
    
    var workspace = workspaceUI.getWorkspace();
    
    alert("FIX THIS! needs to be implmeneted correctly");
    return null;
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];

        let childUndoCommandJson = getMemberStateUndoCommand(workspace,commandData.memberFullName); 

        //OOPS. THIS ISN"T RIGHT

        actionList.push(childActionData);
    }
    
    

    
    return undoCommandJson;
}

compoundsavememberdata.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];
        let data = commandData.updateEntry[1];

        let childActionData = getSaveDataAction(workspace,memberFullName,data,asynchOnComplete);

        actionList.push(childActionData);
    }
    
    var actionData = {};
    actionData.action = "compoundAction";
    actionData.actions = actionList;
    
    var actionResult = doAction(workspace,actionData);
    
    var commandResult = {};
    commandResult.cmdDone = actionResult.actionDone;
    if(actionResult.alertMsg) commandResult.alertMsg = actionResult.alertMsg;
    
    return commandResult;
}

compoundsavememberdata.COMMAND_TYPE = "compoundSaveMemberData";

compoundsavememberdata.isAsynch = true;

CommandManager.registerCommand(compoundsavememberdata);










