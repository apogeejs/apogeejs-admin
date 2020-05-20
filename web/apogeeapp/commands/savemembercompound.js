import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";
import {getSaveDataAction, getMemberStateUndoCommand} from  "/apogeeapp/commands/membersave.js";


/** Compound Update Member Command
*
* Command JSON format:
* {
*   "type":"saveMemberCompound",
*   "updateList": [
*          {    //for data update entry
*              "memberId": (member id),
*              "data": (member data value)
*          },
*          {    //for code update entry
*               "memberId": (member id),
 *              "argList":(argument list json array),
 *              "functionBody":(function body)
 *              "supplementalCode":(supplementalCode code - optional)
 *              "clearCodeDataValue":(value to set data is code cleared - optional)
*          }
*    ]
* }
*/


let savemembercompound = {};

savemembercompound.createUndoCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getModelManager();
    let model = modelManager.getModel();

    let undoCommandJson = {};
    undoCommandJson.type = "saveMemberCompound";
    //each entry looks like the associated command, but with "type" removed
    undoCommandJson.updateList = commandData.updateList.forEach( updateEntry => {
        let childUndoUpdateEntry = getMemberStateUndoCommand(model,updateEntry.memberId);
        //the udpate entry is identical to he command without the type, so we will just delete it
        delete childUndoUpdateEntry.type;
        return childUndoUpdateEntry;
    }) 
    return undoCommandJson;
}

savemembercompound.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();
    
    let actionData = {};
    actionData.action = "compoundAction";
    actionData.actions = commandData.updateList.map( updateEntry => {
        if(updateEntry.data != undefined) {
            return getSaveDataAction(model,
                updateEntry.memberId,
                updateEntry.data);
        }
        else if(updateEntry.functionBody != undefined) {
            return getSetCodeAction(model,
                updateEntry.memberId,
                updateEntry.argList,
                updateEntry.functionBody,
                updateEntry.supplementalCode,
                updateEntry.clearCodeDataValue);
        }
    })
    
    var actionResult = doAction(model,actionData);
    if(!actionResult.actionDone) {
        throw new Error("Error saving member data: " + actionResult.errorMsg);
    }
}

savemembercompound.commandInfo = {
    "type": "saveMemberCompound",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(savemembercompound);