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
function moveMember(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
        
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

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // apply code
    // - modify the member
    // - modify the old parent and all parents up to model
    // - modify the new parent and all parents up to model
    // - TBD - children of the moved member get a new full name, even if they themselves do not change.
    //         What we do here may depend on how we handle compound fields. (Note - we will recalculation 
    //         the dependencies here, but they may not change.)
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
        
    member.move(actionData.targetName,targetOwner);
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;
    
    //add the child action results
    let childActionResults = addChildResults(member);
    if(childActionResults) {
        actionResult.childActionResults = childActionResults;
    }
    
    return actionResult;
}

function addChildResults(member) {
    let childActionResults = [];
    
    if(member.isParent) {    
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.actionDone = true;
            childActionResult.member = child;
            childActionResult.event = ACTION_EVENT;
            actionResult.updateModelDependencies = true;
            
            childActionResults.push(childActionResult);
            
            //add results for children to this member
            grandchildActionResults = addChildResults(child);
            if(grandchildActionResults) {
                childActionResult.childActionResults = grandchildActionResults;
            }
        }
    }
    else if(member.isRootHolder) {
        var root = member.getRoot();
        let childActionResult = {};
        childActionResult.actionDone = true;
        childActionResult.member = root;
        childActionResult.event = ACTION_EVENT;
        actionResult.updateModelDependencies = true;

        childActionResults.push(childActionResult);
        
        //add results for children to this member
        grandchildActionResults = addChildResults(child);
        if(grandchildActionResults) {
            childActionResult.childActionResults = grandchildActionResults;
        }
    }

    if(childActionResults.length > 0) {
        return childActionResults;
    }
    else {
        return null;
    }
}

let ACTION_EVENT = "updated";


//This line of code registers the action 
addActionInfo("moveMember",moveMember);