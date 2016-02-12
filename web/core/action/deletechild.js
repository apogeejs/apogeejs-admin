/** This namespace contains functions to process an create a table. */
visicomp.core.deletechild = {};

/** TABLE CREATED EVENT
 * This listener event is fired when after a table is created, to be used to respond
 * to a new table such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.deletechild.CHILD_DELETED_EVENT = "childDeleted";


/** This is the listener for the create table event.
 * The return value is an ActionResponse object. Optionally, an existing action response
 * may be passed in or otherwise one will be created here. */
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




