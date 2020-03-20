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
 * MEMBER DELETED EVENT: "deleted"
 * Event object Format:
 * {
 *  "member": (member),
 *  }
 */


/** Delete member action function */
function deleteMember(model,actionData) {
    
    var member = model.lookupMemberById(actionData.memberId);
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
    
    let actionResult = doDelete(model, member);
    return actionResult;
    
}


/** @private */
function doDelete(model, member) {

    let actionResult = {};
    actionResult.member = member;
    actionResult.event = ACTION_EVENT;
    
    //delete children first
    if((member.isParent)||(member.isRootHolder)) {
        actionResult.childActionResults = [];
        
        //standard children for parent
        var childMap = member.getChildMap();
        for(var childName in childMap) {
            var child = childMap[childName];
            let childActionResult = doDelete(model, child);
            actionResult.childActionResults.push(childActionResult);
        }
    }
    
    //delete member
    let parent = member.getParent(model);
    if(parent) {
        parent.removeChild(model,member);
    }

    //additional delete member actions
    member.onDeleteMember();
    if(member.isDependent) {
        member.onDeleteDependent(model);
    }
    
    actionResult.actionDone = true;
    actionResult.updateModelDependencies = true;

    return actionResult;
}

let ACTION_EVENT = "deleted";


//This line of code registers the action 
addActionInfo("deleteMember",deleteMember);