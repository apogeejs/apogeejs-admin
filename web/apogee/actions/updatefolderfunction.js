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
function updateProperties(model,actionData) { 

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    var folderFunction = model.getMemberByFullName(actionData.memberId);
    if(!folderFunction) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = folderFunction;

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // update folder function
    // - modify the member
    // - modify parent and all parents up to model
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    
    folderFunction.setArgList(actionData.argList);
    folderFunction.setReturnValueString(actionData.returnValueString);
    
    actionResult.actionDone = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

let ACTION_EVENT = "updated";

//This line of code registers the action 
addActionInfo("updateFolderFunction",updateProperties);

