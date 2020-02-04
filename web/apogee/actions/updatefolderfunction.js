import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateFolderFunction",
 *  "member": (member to move),
 *  "argList": (argument list, as an array of strings)
 *  "returnValueString": (name of the return value table)
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */

/** Update folder function action function */
function updateProperties(model,actionData,actionResult) { 
    
    var memberFullName = actionData.memberName;
    var folderFunction = model.getMemberByFullName(memberFullName);
    if(!folderFunction) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = folderFunction;
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    actionResult.actionDone = true;
    actionResult.updated = apogeeutil.jsonCopy(member.getUpdated());
}

/** Action info */
let ACTION_INFO = {
    "action": "updateFolderFunction",
    "actionFunction": updateProperties,
    "checkUpdateAll": false,
    "updateDependencies": false,
    "addToRecalc": true,
    "event": "memberUpdated"
};


//This line of code registers the action 
addActionInfo(ACTION_INFO);

