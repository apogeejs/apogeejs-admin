import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "deleteMember",
 *  "member": (member to delete),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 *
 * MEMBER DELETED EVENT: "memberDeleted"
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */


/** Delete member action function */
function deleteMember(workspace,actionData,actionResult) {
    
    var memberFullName = actionData.memberName;
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for delete member";
        return;
    }
    actionResult.member = member;
    
    doDelete(member,actionResult);
    
}


/** @private */
function doDelete(member,actionResult) {
    
    //delete children
    if(member.isParent) {
        actionResult.childActionResults = [];
        
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.member = child;
            childActionResult.actionInfo = ACTION_INFO
            
            actionResult.childActionResults.push(childActionResult);
            
            //add results for children to this member
            doDelete(child,childActionResult);
        }
    }
    else if(member.isRootHolder) {
        actionResult.childActionResults = [];
        
        var root = member.getRoot();
        let childActionResult = {};
        childActionResult.member = root;
        childActionResult.actionInfo = ACTION_INFO

        actionResult.childActionResults.push(childActionResult);
        
        //add results for children to this member
        doDelete(child,childActionResult);
    }
    
    //delete member
    member.onDeleteMember();
    if(member.isDependent) {
        member.onDeleteDependent();
    }
    
    actionResult.actionDone = true;
}


/** Action info */
let ACTION_INFO = {
    "action": "deleteMember",
    "actionFunction": deleteMember,
    "checkUpdateAll": true,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": "memberDeleted"
}


//This line of code registers the action 
addActionInfo(ACTION_INFO);