/** This namespace contains functions to process a create of a member */
hax.createmember = {};

/** Create member action */
hax.createmember.ACTION_NAME = "createMember";

/** member CREATED EVENT
 * Event member Format:
 * [member]
 */
hax.createmember.MEMBER_CREATED_EVENT = "memberCreated";

hax.createmember.ACTION_INFO = {
    "actionFunction": hax.createmember.createMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": hax.createmember.MEMBER_CREATED_EVENT
}

hax.action.addEventInfo(hax.createmember.ACTION_NAME,hax.createmember.ACTION_INFO);

/** This method instantiates a member, without setting the update data. 
 *@private */
hax.createmember.createMember = function(actionData,processedActions) {
    
    //create member
    var generator = hax.Workspace.getMemberGenerator(actionData.type);

    if(!generator) {
       //type not found
       actionData.error = new hax.ActionError("Member type not found: " + actionData.type,"AppException",null);
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
        childJson.owner = member;
        hax.createmember.createMember(childJson);
    }
    
    return member;
}