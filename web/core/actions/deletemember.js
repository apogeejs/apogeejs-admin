/** This namespace contains the action to delete a member. */
visicomp.core.deletemember = {};

/** MEMBER DELETED EVENT
 * This listener event is fired when after a member is deleted, to be used to respond
 * such as to update the UI.
 * 
 * Event object Format:
 * [child]
 */
visicomp.core.deletemember.MEMBER_DELETED_EVENT = "memberDeleted";


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
visicomp.core.deletemember.deleteMember = function(member,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        
        var updateDataList = [];
        var recalculateList = [];
        var setDataList = [];
        
        //delete child
        member.onDelete();
        
		var fullName = member.getFullName();
		var workspace = member.getWorkspace();

        workspace.updateForDeletedVariable(member,recalculateList,actionResponse);

        //do data updates if needed
        if(updateDataList.length > 0) {
            visicomp.core.updatemember.updateObjectFunctionOrData(updateDataList,
                recalculateList,
                setDataList,
                actionResponse);
        } 

        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);

        //dispatch events
        workspace.dispatchEvent(visicomp.core.deletemember.MEMBER_DELETED_EVENT,fullName);
        visicomp.core.updatemember.fireUpdatedEventList(setDataList);
        visicomp.core.updatemember.fireUpdatedEventList(recalculateList);
	}
	catch(error) {
        //unknown application error
        var actionError = visicomp.core.ActionError.processFatalAppException(error);
        actionResponse.addError(actionError);
    }
    
    //return response
    return actionResponse;
        
}




