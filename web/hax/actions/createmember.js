/** This namespace contains functions to process a create of a member */
hax.createmember = {};

/** member CREATED EVENT
 * This listener event is fired when after a member is created, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.createmember.MEMBER_CREATED_EVENT = "memberCreated";

hax.createmember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.createmember.MEMBER_CREATED_EVENT,member);
}

hax.createmember.fireCreatedEventList = function(memberList) {
    for(var i = 0; i < memberList.length; i++) {
        hax.createmember.fireCreatedEvent(memberList[i]);
    }
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.createmember.createMember = function(owner,json,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.ActionResponse();
    
    try {      
        var recalculateList = [];
        var creationList = [];
        
        var member = hax.createmember.instantiateMember(owner,json,creationList,actionResponse);
        
        //add the member to the action response
        actionResponse.member = member;

        var workspace = member.getWorkspace();
        workspace.updateDependeciesForModelChange(recalculateList);

        hax.calculation.callRecalculateList(recalculateList,actionResponse);
        
        var updatedButNotCreated = hax.base.getListInFirstButNotSecond(recalculateList,creationList);

        //dispatch events
        hax.createmember.fireCreatedEventList(creationList);
        hax.updatemember.fireUpdatedEventList(updatedButNotCreated);
	}
	catch(error) {
        //unknown application error
        var actionError = hax.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
	return actionResponse;
}

/** This method instantiates a member, without setting the update data. */
hax.createmember.instantiateMember = function(owner,json,creationList,actionResponse) {
    //create member
    var generator = hax.Workspace.getMemberGenerator(json.type);

    if(!generator) {
       //type not found
       var errorMsg = "Member type not found: " + json.type;
       var actionError = new hax.ActionError(errorMsg,"Model",null);
       
       actionResponse.addError(actionError);
       
       return null;
    }

    var childJsonOutputList = [];
    var member = generator.createMember(owner,json,childJsonOutputList);
    creationList.push(member);
    
    //instantiate children if there are any
    for(var i = 0; i < childJsonOutputList.length; i++) {
        var childJson = childJsonOutputList[i];
        hax.createmember.instantiateMember(member,childJson,creationList,actionResponse);
    }
    
    return member;
}