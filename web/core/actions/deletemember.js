/** This namespace contains the action to delete a member. */
hax.core.deletemember = {};

/** MEMBER DELETED EVENT
 * This listener event is fired when after a member is deleted, to be used to respond
 * such as to update the UI.
 * 
 * Event object Format:
 * [child]
 */
hax.core.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
hax.core.deletemember.deleteMember = function(member,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new hax.core.ActionResponse();
    
    try {
        
        var recalculateList = [];
        
        //call delete handlers
        member.onDeleteChild();
        if(member.isDependent) {
            member.onDeleteDependent();
        }
        
		var fullName = member.getFullName();
		var workspace = member.getWorkspace();

        workspace.updateForDeletedVariable(member,recalculateList);

        hax.core.calculation.callRecalculateList(recalculateList,actionResponse);

        //dispatch events
        workspace.dispatchEvent(hax.core.deletemember.MEMBER_DELETED_EVENT,fullName);
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




