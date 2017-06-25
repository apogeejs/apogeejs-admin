/** This namespace contains the create member action */
apogee.createmember = {};

/** Create member action name 
 * Action Data format:
 * {
 *  "action": apogee.createmember.ACTION_NAME,
 *  "owner": (parent/owner for new member),
 *  "name": (name of the new member),
 *  "updateData": (an initial data for the table, table dependent)
 *  
 *  "member": (OUTPUT - the created member),
 *  "error": (OUTPUT - an error created in the action function)
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
apogee.createmember.createMember = function(actionData,optionalContext,processedActions) {
    
    //create member
    var generator = apogee.Workspace.getMemberGenerator(actionData.type);

    if(!generator) {
       //type not found
       actionData.error = new apogee.ActionError("Member type not found: " + actionData.type,"AppException",null);
       return null;
    }

    var childJsonOutputList = [];
    var member = generator.createMember(actionData.owner,actionData,childJsonOutputList);
    
    //store the created object
    actionData.member = member;
    
    //we are potentially adding multiple creates here, including children
    processedActions.push(actionData);
    
    //instantiate children if there are any
    for(var i = 0; i < childJsonOutputList.length; i++) {
        var childJson = childJsonOutputList[i];
        childJson.action = "createMember";
        childJson.actionInfo = actionData.actionInfo; //assume parent action is alsl createMember!
        childJson.owner = member;
        apogee.createmember.createMember(childJson,optionalContext,processedActions);
    }
    
    return member;
}

/** Action info */
apogee.createmember.ACTION_INFO = {
    "actionFunction": apogee.createmember.createMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": apogee.createmember.MEMBER_CREATED_EVENT
}

//This line of code registers the action 
apogee.action.addActionInfo(apogee.createmember.ACTION_NAME,apogee.createmember.ACTION_INFO);