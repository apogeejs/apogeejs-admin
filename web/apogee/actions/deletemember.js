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
apogee.deletemember.deleteMember = function(actionData,optionalContext,processedActions) {

    var deleteList = [];

    apogee.deletemember.getDeleteList(actionData.member,deleteList);
    for(var i = 0; i < deleteList.length; i++) {
        //call delete handlers
        var member = deleteList[i];
        member.onDeleteChild();
        if(member.isDependent) {
            member.onDeleteDependent();
        }   
        
        //we are adding multiple delete events here
        var actionDataEntry;
        if(member == actionData.member) {
            actionDataEntry = actionData;
        }
        else {
            actionDataEntry = {};
            actionDataEntry.action = "deleteMember";
            actionDataEntry.member = member;
            actionDataEntry.actionInfo = actionData.actionInfo;
        }
        
        processedActions.push(actionDataEntry);
    }
}

/** @private */
apogee.deletemember.getDeleteList =  function(member,deleteList) {
    deleteList.push(member);
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