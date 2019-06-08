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
        actionResult.cmdDone = false;
        actionResult.errorMsg = "Member not found for delete member";
        return;
    }
    actionResult.member = member;

    var deleteList = [];

    apogee.deletemember.getDeleteList(member,deleteList);
    for(var i = 0; i < deleteList.length; i++) {
        //call delete handlers
        var member = deleteList[i];
        member.onDeleteMember();
        if(member.isDependent) {
            member.onDeleteDependent();
        }   
        
        //we are adding multiple delete events here
        var actionDataEntry;
        if(member == actionData.member) {
            actionResult.cmdDone = true;
        }
        else {
            if(!actionResult.childActionResults) actionResult.childActionResults = [];
            
            let childActionData = {};
            childActionData.action = "deleteMember";
            childActionData.memberName = member.getFullName();           
            
            let childActionResult = {};
            childActionResult.member = member;
            childActionResult.actionInfo = apogee.deletemember.ACTION_INFO;
            childActionResult.cmdDone = true;
            
            actionResult.childActionResults.push(childReponse);
        }
    }
}

/** @private */
apogee.deletemember.getDeleteList =  function(member,deleteList) {
    //delete children first if there are any
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            apogee.deletemember.getDeleteList(child,deleteList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        apogee.deletemember.getDeleteList(root,deleteList);
    }
    //delete the member
    deleteList.push(member);
}



/** Action info */
apogee.deletemember.ACTION_INFO = {
    "actionFunction": apogee.deletemember.deleteMember,
    "checkUpdateAll": true,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": apogee.deletemember.MEMBER_DELETED_EVENT
}


//This line of code registers the action 
apogee.action.addActionInfo(apogee.deletemember.ACTION_NAME,apogee.deletemember.ACTION_INFO);