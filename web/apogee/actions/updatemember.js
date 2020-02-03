import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {addActionInfo} from "/apogee/actions/action.js";
import ActionError from "/apogee/lib/ActionError.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateData",
 *  "memberName": (member to update),
 *  "data": (new value for the table)
 *  "sourcePromise": (OPTIONAL - If this is the completion of an asynchronous action, the
 *      source promise shoudl be included to make sure it has not been overwritten with a
 *      more recent operation.)
 *  "promiseRefresh": (OPTIONAL - If this action reinstates a previously set promise,
 *      this flag will prevent setting additional then/catch statements on the promise)
 * }
 * 
 * Action Data format:
 * {
 *  "action": "updateCode",
 *  "memberName": (member to update),
 *  "argList": (arg list for the table)
 *  "functionBody": (function body for the table)
 *  "supplementalCode": (supplemental code for the table)
 * }
 */


/** member UPDATED EVENT: "memberUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** Update code action function. */
function updateCode(workspace,actionData,actionResult) {
    
    var memberFullName = actionData.memberName;
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = member;

    if((!member.isCodeable)||(!member.getSetCodeOk())) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "can not set code on member: " + member.getFullName();
        return;
    }
          
    member.applyCode(actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    
    actionResult.actionDone = true;
    actionResult.updated = apogeeutil.jsonCopy(member.getUpdated());
}

/** Update data action function. */
function updateData(workspace,actionData,actionResult) {
    
    var memberFullName = actionData.memberName;
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member data";
        return;
    }
    actionResult.member = member;
    
    if(!member.getSetDataOk()) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Can not set data on member: " + memberFullName;
        return;
    }
        
    var data = actionData.data;
    
    //if this is the resolution (or rejection) of a previously set promise
    if(actionData.sourcePromise) {
        if(member.pendingPromiseMatches(actionData.sourcePromise)) {
            //this is the reoslution of pending data
            member.setResultPending(false);
        }
        else {
            //no action - this is from an asynch action that has been overwritten
            actionResult.actionDone = false;
            return;
        }
    }
    
    //some cleanup for new data
    member.clearErrors();
    if((member.isCodeable)&&(actionData.sourcePromise === undefined)) {
        //clear the code - so the data is used
        //UNLESS this is a delayed set date from a promise, in what case we want to keep the code.
        member.clearCode();
    }
    
    //handle four types of data inputs
    if(data instanceof Promise) {
        //data is a promise - will be updated asynchromously
        
        //check if this is only a refresh
        var optionalPromiseRefresh = actionData.promiseRefresh ? true : false;
        
        member.applyPromiseData(data,actionData.onAsynchComplete,optionalPromiseRefresh);
    }
    else if(data instanceof Error) {
        //data is an error
        var actionError = ActionError.processException(data,ActionError.ERROR_TYPE_MODEL);
        member.addError(actionError);
    }
    else if(data === apogeeutil.INVALID_VALUE) {
        //data is an invalid value
        member.setResultInvalid(true);
    }
    else {
        //normal data update (poosibly from an asynchronouse update)
        member.setData(data);
    }
    
    actionResult.actionDone = true;
    actionResult.updated = apogeeutil.jsonCopy(member.getUpdated());
}
        
/** Update data action info */
let UPDATE_DATA_ACTION_INFO = {
    "action": "updateData",
    "actionFunction": updateData,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": false,
    "addDependenceiesToRecalc": true,
    "event": "memberUpdated"
};

/** Update code action info */
let UPDATE_CODE_ACTION_INFO = {
    "action": "updateCode",
    "actionFunction": updateCode,
    "checkUpdateAll": false,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": "memberUpdated"
};


//The following code registers the actions
addActionInfo(UPDATE_DATA_ACTION_INFO);
addActionInfo(UPDATE_CODE_ACTION_INFO);