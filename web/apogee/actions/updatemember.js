import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "updateData",
 *  "memberId": (member to update),
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
 *  "memberId": (member to update),
 *  "argList": (arg list for the table)
 *  "functionBody": (function body for the table)
 *  "supplementalCode": (supplemental code for the table)
 * }
 */


/** member UPDATED EVENT: "updated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** Update code action function. */
function updateCode(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return actionResult;
    }
    actionResult.member = member;

    if((!member.isCodeable)||(!member.getSetCodeOk())) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "can not set code on member: " + member.getFullName(model);
        return actionResult;
    }
          
    member.applyCode(actionData.argList,
        actionData.functionBody,
        actionData.supplementalCode);
        
    actionResult.actionDone = true;
    actionResult.updateMemberDependencies = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

/** Update data action function. */
function updateData(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member data";
        return actionResult;
    }
    actionResult.member = member;
    
    if(!member.getSetDataOk()) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Can not set data on member: " + member.getFullName(model);
        return actionResult;
    }
        
    var data = actionData.data;

    //see if there were any dependents, to know if we need to update them
    //on setting data there will be none.
    let hadDependents = ((member.getDependsOn)&&(apogeeutil.jsonObjectLength(member.getDependsOn()) > 0));
    
    //if this is the resolution (or rejection) of a previously set promise
    //make sure the source promise matches the pending promise. Otherwise
    //we just ignore it (it is out of date)
    if(actionData.sourcePromise) {
        if(!member.pendingPromiseMatches(actionData.sourcePromise)) {
            //no action - this is from an asynch action that has been overwritten. Ignore this command.
            actionResult.actionDone = true;
            return actionResult;
        }
    }
    
    //some cleanup for new data
    if((member.isCodeable)&&(actionData.sourcePromise === undefined)) {
        //clear the code - so the data is used
        //UNLESS this is a delayed set date from a promise, in what case we want to keep the code.
        member.clearCode(model);
    }

    //apply the data
    member.applyData(model,data);

    //if the data is a promise, we must also initiate the asynchronous setting of the data
    if((data)&&(data instanceof Promise)) {
        member.applyAsynchData(model,data);
    }
    
    actionResult.actionDone = true;
    if(hadDependents) {
        actionResult.updateMemberDependencies = true;
    }
    actionResult.recalculateDependsOnMembers = true;

    return actionResult;
}

let ACTION_EVENT = "updated";

//The following code registers the actions
addActionInfo("updateCode",updateCode);
addActionInfo("updateData",updateData);