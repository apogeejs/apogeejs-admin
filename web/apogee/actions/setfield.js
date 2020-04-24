import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 * 
 * This sets a field value on a member.
 *
 * Action Data format:
 * {
 *  "action": "setField",
 *  "memberId": (member to update),
 *  "fieldName": (the name of the field to update)
 *  "fieldValue": (the new field value)
 * }
 */


/** member UPDATED EVENT: "updated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** Update code action function. */
function setField(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
    
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for update member code";
        return;
    }
    actionResult.member = member;
          
    member.setField(actionData.fieldName,actionData.fieldValue);
        
    actionResult.actionDone = true;
    actionResult.recalculateMember = true;

    return actionResult;
}

let ACTION_EVENT = "updated";

//The following code registers the actions
addActionInfo("setField",setField);