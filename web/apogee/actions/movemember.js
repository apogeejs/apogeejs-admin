import action from "/apogee/actions/action.js";

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
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;
    
    var targetOwnerFullName = actionData.targetOwnerName;
    var targetOwner = workspace.getMemberByFullName(targetOwnerFullName);
    if(!targetOwner) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "New parent not found for move member";
        return;
    }
        
    member.move(actionData.targetName,targetOwner);
    actionResult.actionDone = true;
    
    //add the child action results
    apogee.movemember.addChildResults(member,actionResult);
}

apogee.movemember.addChildResults = function(member,actionResult) {
    
    if(member.isParent) {
        actionResult.childActionResults = {};
        
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.actionDone = true;
            childActionResult.member = child;
            childActionResult.actionInfo = apogee.movemember.ACTION_INFO
            
            actionResult.childActionResults[childName] = childActionResult;
            
            //add results for children to this member
            apogee.movemember.addChildResults(child,childActionResult);
        }
    }
    else if(member.isRootHolder) {
        actionResult.childActionResults = {};
        
        var root = member.getRoot();
        let childActionResult = {};
        childActionResult.actionDone = true;
        childActionResult.member = root;
        childActionResult.actionInfo = apogee.movemember.ACTION_INFO

        actionResult.childActionResults["root"] = childActionResult;
        
        //add results for children to this member
        addChildResults(child,childActionResult);
    }
}


/** Action info */
apogee.movemember.ACTION_INFO = {
    "action": apogee.movemember.ACTION_NAME,
    "actionFunction": apogee.movemember.moveMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.updatemember.MEMBER_UPDATED_EVENT
};


//This line of code registers the action 
action.addActionInfo(apogee.movemember.ACTION_NAME,apogee.movemember.ACTION_INFO);