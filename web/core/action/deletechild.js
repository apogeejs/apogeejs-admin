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


/** This is the listener for the create table event. */
visicomp.core.deletechild.deleteChild = function(child) {
	var actionResponse = visicomp.core.action.createActionResponse();
	var errors = actionResponse.errors;
	var errorMsg;
	var actionError;
	
	//clear success on error
	actionResponse.success = true;
    
    try {
		//create table
		var fullName = child.getFullName();
		var workspace = child.getWorkspace();
		
		child.onDelete();
        
        //do any updates to other objects because of the deleted table
		try {
			workspace.updateForDeletedVariable(child);
		}
		catch(error) {
			//failure to create object
			if(error.stack) {
				console.error(error.stack);
			}
//DONT DO THIS WITH AN EXCEPTION - PAS IN ERRORS OR ACTION RESPONSE
//ERROS SEEMS OK LIKE BEFORE EXCEPT IT WOULD BE NICE TO MARK FAILURE WHEN AN ERROR IS ADDED.
//MAYBE I SHOULD CHANGE THAT EVERYWHERE?
            errorMsg = error.message ? error.message : null;
            actionError = new visicomp.core.ActionError(errorMsg,member);
            actionError.setParentException(error);
            member.setCodeError(actionError);
            errors.add(actionError);
			
			actionResponse.success = false;
		}
		
		//dispatch event
		workspace.dispatchEvent(visicomp.core.deletechild.CHILD_DELETED_EVENT,fullName);

		//return success
		return actionResponse;
	}
	finally {
        //we shouldn't reach here. if we do it is an app error
		//maybe I should mark this fatal. It is not certain if the app is in a valid state.
		errorMsg = "Unknown application error";
		actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.action.ACTION_ERROR_APP);
		errors.add(actionError);

		actionResponse.success = false;
		actionResponse.actionDone = false;
		return actionResponse;
    }
}




