/** This namespace contains functions to process a create of a member */
visicomp.core.createmember = {};

/** member CREATED EVENT
 * This listener event is fired when after a member is created, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.createmember.MEMBER_CREATED_EVENT = "memberCreated";

visicomp.core.createmember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.createmember.MEMBER_CREATED_EVENT,member);
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
visicomp.core.createmember.createMember = function(folder,json,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        
        var updateDataList = [];
        var recalculateList = [];
        var setDataList = [];
        
        var member = visicomp.core.createmember.instantiateMember(folder,json,updateDataList,actionResponse);
        
        //add the member to the action response
        actionResponse.member = member;
        
        if(member != null) {
        
            var workspace = member.getWorkspace();
            
            workspace.updateForAddedVariable(member,recalculateList);

            //do data updates if needed
            if(updateDataList.length > 0) {
                visicomp.core.updatemember.updateObjectFunctionOrData(updateDataList,
                    recalculateList,
                    setDataList,
                    actionResponse);
            } 
            
            var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);

            //dispatch events
            workspace.dispatchEvent(visicomp.core.createmember.MEMBER_CREATED_EVENT,member);
            visicomp.core.updatemember.fireUpdatedEventList(setDataList);
            visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
        }

		
	}
	catch(error) {
        //unknown application error
        var actionError = visicomp.core.ActionError.processAppException(error,true);
        actionResponse.addError(actionError);
    }
    
    //return response
	return actionResponse;
}

/** This method instantiates a member, without setting the update data. */
visicomp.core.createmember.instantiateMember = function(folder,json,updateDataList,actionResponse) {
    //create member
    var generator = visicomp.core.Workspace.getMemberGenerator(json.type);

    if(!generator) {
       //type not found
       var errorMsg = "Member type not found: " + json.type;
       var actionError = new visicomp.core.ActionError(errorMsg,"Model",null);
       
       actionResponse.addError(actionError);
       
       return null;
    }

    var member = generator.createMember(folder,json,updateDataList,actionResponse);
    
    return member;
}