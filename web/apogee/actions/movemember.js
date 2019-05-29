/** This namespace contains the move member action */
apogee.movemember = {};

/** Move member action name 
 * Action Data format:
 * {
 *  "action": apogee.movemember.ACTION_NAME,
 *  "member": (member to move),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */
apogee.movemember.ACTION_NAME = "moveMember";

/** Move member action function */
apogee.movemember.moveMember = function(actionData,processedActions) {
        
    var member = actionData.member;
        
    var movedMemberList = [];
    apogee.movemember.loadMovedList(member,movedMemberList);
    member.move(actionData.name,actionData.owner);
    
    //add the individual moves
    for(var i = 0; i < movedMemberList.length; i++) {
        var moveMember = movedMemberList[i];
        
        //we are adding multiple delete events here
        var actionDataEntry;
        if(moveMember === member) {
            actionDataEntry = actionData;
        }
        else {
            actionDataEntry = {};
            actionDataEntry.action = "moveMember";
            actionDataEntry.member = member;
            actionDataEntry.name = member.getName();
            actionDataEntry.owner = member.getOwner();
            actionDataEntry.actionInfo = actionData.actionInfo;
        }
        
        processedActions.push(actionDataEntry);
    }

}

/** this creates the moved info list, including the member and the old name, but not the new name
 * @private */
apogee.movemember.loadMovedList = function(member,movedMemberList) {
    movedMemberList.push(member);
    
    if(member.isParent) {
        var childMap = member.getChildMap();
        for(var key in childMap) {
            var child = childMap[key];
            apogee.movemember.loadMovedList(child,movedMemberList);
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        apogee.movemember.loadMovedList(root,movedMemberList);
    }
}

/** Action info */
apogee.movemember.ACTION_INFO= {
    "actionFunction": apogee.movemember.moveMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};


//This line of code registers the action 
apogee.action.addActionInfo(apogee.movemember.ACTION_NAME,apogee.movemember.ACTION_INFO);