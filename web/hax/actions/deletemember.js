/** This namespace contains the delete member action */
hax.deletemember = {};

/** Delete member action name 
 * Action Data format:
 * {
 *  "action": hax.deletemember.ACTION_NAME,
 *  "member": (member to delete),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */
hax.deletemember.ACTION_NAME = "deleteMember";

/** MEMBER DELETED EVENT
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */
hax.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";

/** Delete member action function */
hax.deletemember.deleteMember = function(actionData,optionalContext,processedActions) {

    var deleteList = [];

    hax.deletemember.getDeleteList(actionData.member,deleteList);
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
hax.deletemember.getDeleteList =  function(member,deleteList) {
    deleteList.push(member);
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            hax.deletemember.getDeleteList(child,deleteList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        hax.deletemember.getDeleteList(root,deleteList);
    }
}



/** Action info */
hax.deletemember.ACTION_INFO = {
    "actionFunction": hax.deletemember.deleteMember,
    "checkUpdateAll": true,
    "updateDependencies": false,
    "addToRecalc": false,
    "event": hax.deletemember.MEMBER_DELETED_EVENT
}


//This line of code registers the action 
hax.action.addActionInfo(hax.deletemember.ACTION_NAME,hax.deletemember.ACTION_INFO);