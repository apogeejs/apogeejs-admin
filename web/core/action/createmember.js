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
 * The return value is an ActionResponse object */
visicomp.core.createmember.createMember = function(folder,json) {
	var actionResponse = visicomp.core.action.createActionResponse();
	var errors = actionResponse.errors;
	var errorMsg;
	var actionError;
	
	//clear success on error
	actionResponse.success = true;
    
    try {
		//create member
        var generator = visicomp.core.Workspace.getMemberGenerator(json.type);
        
		if(!generator) {
			//type not found
			errorMsg = "Member type not found: " + json.type;
            actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.action.ACTION_ERROR_MODEL);
            errors.add(actionError);
			
			actionResponse.success = false;
			actionResponse.actionDone = false;
			return actionResponse;
		}
		
		var workspace = folder.getWorkspace();
        var updateDataList = [];

        var member;
		try {
			member = generator.createMember(folder,json,updateDataList);
		}
		catch(error) {
			//failure to create object
			if(error.stack) {
				console.error(error.stack);
			}
            errorMsg = error.message ? error.message : null;
            actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.action.ACTION_ERROR_MODEL);
            actionError.setParentException(error);
            errors.add(actionError);
			
			actionResponse.success = false;
			actionResponse.actionDone = false;
			return actionResponse;
		}
		
		//object created if we get here - save it to the response
		actionResponse.actionDone = true;
		actionResponse.member = member;
		
        //do data updates if needed
        if(updateDataList.length > 0) {
            var updateActionResponse = visicomp.core.updatemember.updateObjects(updateDataList);
			if(!updateActionResponse.success) {
				//we should merge this, but for now I will just copy if since there is no 
				//inforamtion (FOR NOW) in the existing action reponse
				actionResponse = updateActionResponse;
			}
        }
        
        //do any updates to other objects because of the added obejct
		try {
			workspace.updateForAddedVariable(member);
		}
		catch(error) {
//DONT DO THIS WITH AN EXCEPTION - PAS IN ERRORS OR ACTION RESPONSE
//ERROS SEEMS OK LIKE BEFORE EXCEPT IT WOULD BE NICE TO MARK FAILURE WHEN AN ERROR IS ADDED.
//MAYBE I SHOULD CHANGE THAT EVERYWHERE?
			if(error.stack) {
				console.error(error.stack);
			}
            errorMsg = error.message ? error.message : null;
            actionError = new visicomp.core.ActionError(errorMsg,member);
            actionError.setParentException(error);
            member.setCodeError(actionError);
            errors.add(actionError);
			
			actionResponse.success = false;
		}


		//dispatch event
		workspace.dispatchEvent(visicomp.core.createmember.MEMBER_CREATED_EVENT,member);

		//return response
		return actionResponse;
	}
	catch(outsideError) {
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




