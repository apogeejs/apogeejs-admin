/** This namespace contains functions to process a create of a member */
hax.core.createmember = {};

/** member CREATED EVENT
 * This listener event is fired when after a member is created, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.core.createmember.MEMBER_CREATED_EVENT = "memberCreated";

hax.core.createmember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.core.createmember.MEMBER_CREATED_EVENT,member);
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.createmember.createMember = function(folder,json,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {      
        var recalculateList = [];
        
        var updateDataList = [];
        var setDataList = [];
        
        var member = hax.core.createmember.instantiateMember(folder,json,updateDataList,actionResponse);
        
        //add the member to the action response
        actionResponse.member = member;

        
        var workspace = member.getWorkspace();

        workspace.updateForAddedVariable(member,recalculateList);

        //do data updates if needed
        if(updateDataList.length > 0) {
            hax.core.updatemember.updateObjectFunctionOrData(updateDataList,
                recalculateList,
                setDataList,
                actionResponse);
        } 

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);

        //dispatch events
        workspace.dispatchEvent(hax.core.createmember.MEMBER_CREATED_EVENT,member);
        hax.core.updatemember.fireUpdatedEventList(setDataList);
        hax.core.updatemember.fireUpdatedEventList(recalculateList);

	}
	catch(error) {
        //unknown application error
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
	return actionResponse;
}

/** This method instantiates a member, without setting the update data. */
hax.core.createmember.instantiateMember = function(folder,json,updateDataList,actionResponse) {
    //create member
    var generator = hax.core.Workspace.getMemberGenerator(json.type);

    if(!generator) {
       //type not found
       var errorMsg = "Member type not found: " + json.type;
       var actionError = new hax.core.ActionError(errorMsg,"Model",null);
       
       actionResponse.addError(actionError);
       
       return null;
    }

    var member = generator.createMember(folder,json,updateDataList,actionResponse);
    
    return member;
}