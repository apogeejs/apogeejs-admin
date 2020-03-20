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
        
    var member = model.lookupMemberById(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;

    var targetOwner = model.lookupMemberById(actionData.targetOwnerId);
    if(!targetOwner) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "New parent not found for move member";
        return;
    }

    //if the owner changes, remove this child from the owner
    //remove from old named object from the new or old owner - if it stays, we still have the new name
    let currentOwner = member.getOwner(model);
    if(currentOwner.isParent) {
        currentOwner.removeChild(model,member);
    }
    else {
        //don't allow moving a root for now!
        //or renaiming either!
    }
        
    //appl the move to the member
    member.move(actionData.targetName,targetOwner);

    //set the member in the new/old owner (rest in old owner to handle a name change)
    if(targetOwner.isParent) {
        targetOwner.addChild(model,member);
    }
    else {
        //don't allow moving a root for now!
        //or renaiming either!
    }

    //create the action result
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;
    actionResult.recalculateDependsOnMembers = true;
    
    //add the child action results
    let childActionResults = addChildResults(member);
    if(childActionResults) {
        actionResult.childActionResults = childActionResults;
    }
    
    return actionResult;
}

function addChildResults(member) {
    let childActionResults = [];
    
    if((member.isParent)||(member.isRootHolder)) {  
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = {};
            childActionResult.actionDone = true;
            childActionResult.member = child;
            childActionResult.event = ACTION_EVENT;
            childActionResult.updateModelDependencies = true;
            
            childActionResults.push(childActionResult);
            
            //add results for children to this member
            let grandchildActionResults = addChildResults(child);
            if(grandchildActionResults) {
                childActionResult.childActionResults = grandchildActionResults;
            }
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