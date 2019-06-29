/** This namespace contains the delete member action */
apogee.deletemember = {};

/** Delete member action name 
 * Action Data format:
 * {
 *  "action": apogee.deletemember.ACTION_NAME,
 *  "member": (member to delete),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */
apogee.deletemember.ACTION_NAME = "deleteMember";

/** MEMBER DELETED EVENT
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */
apogee.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";

/** Delete member action function */
apogee.deletemember.deleteMember = function(workspace,actionData,actionResult) {
    
    var memberFullName = actionData.memberName;
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for delete member";
        return;
    }
    actionResult.member = member;
    
    apogee.deletemember.doDelete(member,actionResult);
    
}


/** @private */
apogee.deletemember.doDelete = function(member,actionResult) {
    
    //delete children
    if(member.isParent) {
        actionResult.childActionResults = {};
        
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.member = child;
            childActionResult.actionInfo = apogee.deletemember.ACTION_INFO
            
            actionResult.childActionResults[childName] = childActionResult;
            
            //add results for children to this member
            apogee.deletemember.doDelete(child,childActionResult);
        }
    }
    else if(member.isRootHolder) {
        actionResult.childActionResults = {};
        
        var root = member.getRoot();
        let childActionResult = {};
        childActionResult.member = root;
        childActionResult.actionInfo = apogee.deletemember.ACTION_INFO

        actionResult.childActionResults["root"] = childActionResult;
        
        //add results for children to this member
        apogee.deletemember.doDelete(child,childActionResult);
    }
    
    //delete member
    member.onDeleteMember();
    if(member.isDependent) {
        member.onDeleteDependent();
    }
    
    actionResult.actionDone = true;
}


/** Action info */
apogee.deletemember.ACTION_INFO = {
    "action": apogee.deletemember.ACTION_NAME,
    "actionFunction": apogee.deletemember.deleteMember,
    "checkUpdateAll": true,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": apogee.deletemember.MEMBER_DELETED_EVENT
}


//This line of code registers the action 
apogee.action.addActionInfo(apogee.deletemember.ACTION_NAME,apogee.deletemember.ACTION_INFO);