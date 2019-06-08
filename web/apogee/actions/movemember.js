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
apogee.movemember.moveMember = function(workspace,actionData,actionResult) {
        
    var memberFullName = actionData.memberName;
    var member = workspace.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.cmdDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;
    
    var targetOwnerFullName = actionData.targetOwnerName;
    var targetOwner = workspace.getMemberByFullName(targetOwnerFullName);
    if(!targetOwner) {
        actionResult.cmdDone = false;
        actionResult.errorMsg = "New parent not found for move member";
        return;
    }
        
    var movedMemberList = [];
    apogee.movemember.loadMovedList(member,movedMemberList);
    member.move(actionData.targetName,targetOwner);
    
    //add the individual moves
    for(var i = 0; i < movedMemberList.length; i++) {
        var movedMember = movedMemberList[i];
        
        //we are adding multiple delete events here
        var actionDataEntry;
        if(movedMember === member) {
            actionDataEntry = actionData;
        }
        else {
            if(!actionResult.childActionResults) actionResult.childActionResults = [];
            
            let childActionData = {};
            childActionData.action = "moveMember";
            childActionData.memberName = movedMember.getFullName();
            childActionData.targetName = movedMember.getName();
            childActionData.targetOwnerName = movedMember.getOwner().getFullName();
            
            let childActionResult = {};
            childActionResult.cmdDone = true;
            childActionResult.member = movedMember;
            childRepsonse.actionInfo = apogee.movemember.ACTION_INFO
            
            actionResult.childActionResults.push(childActionResult);
        }
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
apogee.movemember.ACTION_INFO = {
    "actionFunction": apogee.movemember.moveMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};


//This line of code registers the action 
apogee.action.addActionInfo(apogee.movemember.ACTION_NAME,apogee.movemember.ACTION_INFO);