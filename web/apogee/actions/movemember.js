import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "moveMember",
 *  "member": (member to move),
 *  "targetName": (optional new name for the member - defaults to no new name)
 *  "targetParentId": (optiona new parent id - defaults to old parent id)
 *  
 *  \
 * }
 */

/** Move member action function */
function moveMember(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;
        
    var member = model.getMutableMember(actionData.memberId);
    if(!member) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for move member";
        return;
    }
    actionResult.member = member;

    //get the name
    let targetName;
    if(actionData.targetName) {
        targetName = actionData.targetName;
    }
    else {
        targetName = member.getName();
    }

    //get the parent
    let targetParentId;
    if(actionData.targetParentId) {
        targetParentId = actionData.targetParentId;
    }
    else {
        targetParentId = member.getParentId();
    }
    var targetParent = model.getMutableMember(targetParentId);
    if(!targetParent) {
        actionResult.actionDone = false;
        actionResult.errorMsg = "Parent not found for move member";
        return actionResult;
    }

    //if the parent changes, remove this child from the parent
    //remove from old named object from the new or old parent - if it stays, we still have the new name
    let currentParentId = member.getParentId();
    let currentParent = model.getMutableMember(currentParentId);
    if(currentParent.isParent) {
        currentParent.removeChild(model,member);
    }
    else {
        //don't allow moving a root for now!
        //or renaiming either!
    }
        
    //appl the move to the member
    member.move(targetName,targetParent);

    //set the member in the new/old parent (rest in old parent to handle a name change)
    if(targetParent.isParent) {
        targetParent.addChild(model,member);
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
    let childActionResults = addChildResults(model,member);
    if(childActionResults) {
        actionResult.childActionResults = childActionResults;
    }
    
    return actionResult;
}

function addChildResults(model,member) {
    let childActionResults = [];
    
    if((member.isParent)||(member.isRootHolder)) {  
        var childIdMap = member.getChildIdMap();
        for(var childName in childIdMap) {
            var childId = childIdMap[childName];
            let child = model.lookupMemberById(childId);
            if(child) {
                let childActionResult = {};
                childActionResult.actionDone = true;
                childActionResult.member = child;
                childActionResult.event = ACTION_EVENT;
                childActionResult.updateModelDependencies = true;
                
                childActionResults.push(childActionResult);
                
                //add results for children to this member
                let grandchildActionResults = addChildResults(model,child);
                if(grandchildActionResults) {
                    childActionResult.childActionResults = grandchildActionResults;
                }
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