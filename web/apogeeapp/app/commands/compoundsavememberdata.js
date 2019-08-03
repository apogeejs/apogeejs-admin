import util from "/apogeeutil/util.js";
import {doAction} from "/apogee/actions/action.js";

/** Save Member Data Command
 *
 * Command JSON format:
 * {
 *   "type":"compoundSaveMemberData",
 *   "memberFullName":(main member full name),
 *   "updateInfo":(member data values)
 * }
 */ 
apogeeapp.app.compoundsavememberdata = {};

//=====================================
// Action
//=====================================

apogeeapp.app.compoundsavememberdata.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.compoundsavememberdata.COMMAND_TYPE;
    
    var workspace = workspaceUI.getWorkspace();
    
    alert("IX THIS! needs to be implmeneted correctly");
    return null;
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];

        let childUndoCommandJson = apogeeapp.app.membersave.getMemberStateUndoCommand(workspace,commandData.memberFullName); 

        //OOPS. THIS ISN"T RIGHT

        actionList.push(childActionData);
    }
    
    

    
    return undoCommandJson;
}

apogeeapp.app.compoundsavememberdata.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var workspace = workspaceUI.getWorkspace();
    
    //make the action list
    var actionList = [];
    for(var i = 0; i < commandData.updateInfo.length; i++) {
        let updateEntry = commandData.updateInfo[i];
        let memberFullName = commandData.updateEntry[0];
        let data = commandData.updateEntry[1];

        let childActionData = apogeeapp.app.membersave.getSaveDataAction(workspace,memberFullName,data,asynchOnComplete);

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

apogeeapp.app.compoundsavememberdata.COMMAND_TYPE = "compoundSaveMemberData";

apogeeapp.app.addlink.compoundsavememberdata = true;

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.compoundsavememberdata);










