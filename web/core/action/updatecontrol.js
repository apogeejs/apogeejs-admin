/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.updatecontrol = {};

/** UPDATE CONTROL HANDLER
 * This handler should be called to request an update to a member, including the
 * value, the formula or the initilializer.
 * 
 * Event member format:
 * { 
 *	member: [member], 
 *	value: [data], //if data is set directly, otherwise use code 
 *	functionBody: [formula text],
 *	supplementalCode: [supplementalCode],
 * }
 */
visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER = "updateControl";

/** member UPDATED EVENT
 * This listener event is fired when after a member is updated, to be used to respond
 * to the member update such as to update the UI.
 * 
 * Event member Format:
 * [member]
 */
visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT = "controlUpdated";

visicomp.core.updatecontrol.fireUpdatedEvent = function(member) {
    var workspace = member.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT,member);
}

/** This is the listener for the update member event. */
visicomp.core.updatecontrol.onUpdateObject = function(updateData) {
    var returnValue;
    
    try {
		//update member content
		visicomp.core.updatecontrol.setContent(updateData);

		//return success
		returnValue = {"success":true};
	}
	finally {
        //for now we will not catch errors but let the broswer take care of them
        //in the future we want the debugger handling for user code errors.
        if(!returnValue) {
            alert("There was an error. See the browser debugger.");
        }
    }
    
    return returnValue;
}

    
/** This method subscribes to the update member handler event */
visicomp.core.updatecontrol.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER, 
            visicomp.core.updatecontrol.onUpdateObject);
}


/** This method updates the data for the member. It should be implemented by
 * the member.
 * @protected */
visicomp.core.updatecontrol.setContent = function(contentData) {
    var control = contentData.control;
	if(!control) {
		alert("Error: missing control object");
		return;
	}

    //read handler data
    control.setContent(contentData.html,contentData.onLoadBody,contentData.supplementalCode,contentData.css);
		
    //fire this for the change in value
    visicomp.core.updatecontrol.fireUpdatedEvent(control);
}	



