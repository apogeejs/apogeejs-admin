import {addActionInfo} from "/apogee/actions/action.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "deleteMember",
 *  "member": (member to delete),
 *  
 *  "eventInfo": (OUTPUT - event info for the associated delete event)
 * }
 *
 * MEMBER DELETED EVENT: "memberDeleted"
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */


/** Delete member action function */
function deleteMember(model,actionData) {
    
    var memberFullName = actionData.memberName;
    var member = model.getMemberByFullName(memberFullName);
    if(!member) {
        let actionResult = {};
        actionResult.actionDone = false;
        actionResult.errorMsg = "Member not found for delete member";
        return actionResult;
    }

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // delete member (and all children)
    // - modify parent and all parents up to model
    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    
    let actionResult = doDelete(member);
    return actionResult;
    
}


/** @private */
function doDelete(member) {

    let actionResult = {};
    actionResult.member = member;
    actionResult.event = ACTION_EVENT;
    
    //delete children first
    if(member.isParent) {
        actionResult.childActionResults = [];
        
        //standard children for parent
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = doDelete(child);
            actionResult.childActionResults.push(childActionResult);
        }
    }
    else if(member.isRootHolder) {
        actionResult.childActionResults = [];
        
        //child is the root of this object
        var root = member.getRoot();
        let childActionResult = doDelete(root);

        actionResult.childActionResults.push(childActionResult);
    }
    
    //delete member
    member.onDeleteMember();
    if(member.isDependent) {
        member.onDeleteDependent();
    }
    
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;

    return actionResult;
}

let ACTION_EVENT = "memberDeleted";


//This line of code registers the action 
addActionInfo("deleteMember",deleteMember);