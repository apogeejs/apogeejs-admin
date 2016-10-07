/** This namespace contains functions to process a create of a member */
hax.core.movemember = {};

/** member MOVE EVENT
 * This listener event is fired when after a member is moveded, meaning either
 * the name or folder is updated. It is to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
hax.core.movemember.MEMBER_MOVED_EVENT = "memberMoved";

hax.core.movemember.fireCreatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(hax.core.movemember.MEMBER_MOVED_EVENT,member);
}

/** This method creates member according the input json, in the given folder.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
hax.core.movemember.moveMember = function(member,name,folder,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        
        var updateDataList = [];
        var recalculateList = [];
        var setDataList = [];
        
        var moveInfo = {};
        
        moveInfo.oldFullName = member.getFullName();
        member.changeOwner(folder);
        moveInfo.newFullName = member.getFullName();
        
        //add the member to the action response
        actionResponse.member = member;
        
        if(member != null) {
        
            var workspace = member.getWorkspace();
            
            workspace.updateForDeletedVariable(member,recalculateList,actionResponse);
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
            workspace.dispatchEvent(hax.core.movemember.MEMBER_MOVED_EVENT,moveInfo);
            hax.core.updatemember.fireUpdatedEventList(setDataList);
            hax.core.updatemember.fireUpdatedEventList(recalculateList);
        }

		
	}
	catch(error) {
        //unknown application error
        var actionError = hax.core.ActionError.processException(error,"AppException",true);
        actionResponse.addError(actionError);
    }
    
    //return response
	return actionResponse;
}

