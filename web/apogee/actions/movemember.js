import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "moveMember",
 *  "member": (member to move),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 */

/** Move member action function */
function moveMember(model,actionData,actionResult) {
        
    var memberFullName = actionData.memberName;
    var member = model.getMemberByFullName(memberFullName);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;
    
    var targetOwnerFullName = actionData.targetOwnerName;
    var targetOwner = model.getMemberByFullName(targetOwnerFullName);
    if(!targetOwner) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "New parent not found for move member";
        return;
    }
        
    member.move(actionData.targetName,targetOwner);
    actionResult.actionDone = true;
    actionResult.updated = apogeeutil.jsonCopy(member.getUpdated());
    
    //add the child action results
    addChildResults(member,actionResult);
}

function addChildResults(member,actionResult) {
    
    if(member.isParent) {
        actionResult.childActionResults = [];
        
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.actionDone = true;
            childActionResult.member = child;
            childActionResult.updated = apogeeutil.jsonCopy(child.getUpdated());
            childActionResult.actionInfo = ACTION_INFO;
            
            actionResult.childActionResults.push(childActionResult);
            
            //add results for children to this member
            addChildResults(child,childActionResult);
        }
    }
    else if(member.isRootHolder) {
        actionResult.childActionResults = [];
        
        var root = member.getRoot();
        let childActionResult = {};
        childActionResult.actionDone = true;
        childActionResult.member = root;
        childActionResult.actionInfo = ACTION_INFO;

        actionResult.childActionResults.push(childActionResult);
        
        //add results for children to this member
        addChildResults(root,childActionResult);
    }
}


/** Action info */
let ACTION_INFO = {
    "action": "moveMember",
    "actionFunction": moveMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": "memberUpdated"
};


//This line of code registers the action 
addActionInfo(ACTION_INFO);