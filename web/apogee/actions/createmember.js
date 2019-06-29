/** This namespace contains the create member action */
apogee.createmember = {};

/** Create member action name 
 * Action Data format:
 * {
 *  "action": apogee.createmember.ACTION_NAME,
 *  "owner": (parent/owner for new member),
 *  "name": (name of the new member),
 *  "createData": 
 *      - name
 *      - unique table type name
 *      - additional table specific data
 *  
 * }
 */
apogee.createmember.ACTION_NAME = "createMember";

/** member CREATED EVENT
 * Event member format:
 * {
 *  "member": (member)
 * }
 */
apogee.createmember.MEMBER_CREATED_EVENT = "memberCreated";

/** This method instantiates a member, without setting the update data. 
 *@private */
apogee.createmember.createMember = function(workspace,actionData,processedActions,actionResult) {
    
    var owner;
    if(actionData.workspaceIsOwner) {
        owner = workspace;
    }
    else {
        var ownerFullName = actionData.ownerName;
        var owner = workspace.getMemberByFullName(ownerFullName);
        if(!owner) {
            actionResult.actionDone = false;
            actionResult.alertMsg = "Parent not found for created member";
            return;
        }
    }
 
    apogee.createmember._createMemberImpl(owner,actionData,processedActions,actionResult);
}
 
    
apogee.createmember._createMemberImpl = function(owner,actionData,actionResult) {
    
    var memberJson = actionData.createData;
    var member;
     
    //create member
    var generator;
    if(memberJson) {
        generator = apogee.Workspace.getMemberGenerator(memberJson.type);
    }

    if(generator) {
        member = generator.createMember(owner,memberJson);   

        //instantiate children if there are any
        if(memberJson.children) {
            actionResult.childActionResults = {};
            for(var childName in memberJson.children) {
                var childActionData = {};
                childActionData.action = "createMember";
                childActionData.createData = memberJson.children[childName];
                var childActionResult = {};
                childActionResult.actionInfo = apogee.createmember.ACTION_INFO;
                apogee.createmember._createMemberImpl(member,childActionData,childActionResult);
                actionResult.childActionResults[childName] = childActionResult;
            }
        }
    }
    else {
        //type not found! - create a dummy object and add an error to it
        member = apogee.ErrorTable.generator.createMember(owner,memberJson);
        var error = new apogee.ActionError("Member type not found: " + memberJson.type,apogee.ActionError.ERROR_TYPE_APP,null);
        member.addError(error);
        
        //store an error message, but this still counts as command done.
        actionResult.alertMsg = "Error creating member: member type not found: " + memberJson.type;
    }

    actionResult.member = member;
    actionResult.actionDone = true;
}

/** Action info */
apogee.createmember.ACTION_INFO = {
    "action": apogee.createmember.ACTION_NAME,
    "actionFunction": apogee.createmember.createMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.createmember.MEMBER_CREATED_EVENT
}

//This line of code registers the action 
apogee.action.addActionInfo(apogee.createmember.ACTION_NAME,apogee.createmember.ACTION_INFO);