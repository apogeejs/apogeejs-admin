/** This namespace contains the action to delete a child. */
visicomp.core.deletechild = {};

/** CHILD DELETED EVENT
 * This listener event is fired when after a child is deleted, to be used to respond
 * such as to update the UI.
 * 
 * Event object Format:
 * [child]
 */
visicomp.core.deletechild.CHILD_DELETED_EVENT = "childDeleted";


/** This method should be called to delete a child. The return value is an ActionResponse.
 * It will by default create its own action response object, however optionally an
 * existing action response may be passed in. */
visicomp.core.deletechild.deleteChild = function(child,optionalActionResponse) {
	var actionResponse = optionalActionResponse ? optionalActionResponse : new visicomp.core.ActionResponse();
    
    try {
        
        var updateDataList = [];
        var recalculateList = [];
        var setDataList = [];
        
        //delete child
        child.onDelete();
        
		var fullName = child.getFullName();
		var workspace = child.getWorkspace();

        workspace.updateForDeletedVariable(child,recalculateList,actionResponse);

        //do data updates if needed
        if(updateDataList.length > 0) {
            visicomp.core.updatemember.updateObjectFunctionOrData(updateDataList,
                recalculateList,
                setDataList,
                actionResponse);
        } 

        var calcSuccess = visicomp.core.updatemember.doRecalculate(recalculateList,actionResponse);

        //dispatch events
        workspace.dispatchEvent(visicomp.core.deletechild.CHILD_DELETED_EVENT,fullName);
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




