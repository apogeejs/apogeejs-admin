/** This namespace contains functions to process an update to an control
 * which inherits from the FunctionBase component. */
visicomp.core.updatecontrol = {};

/** UPDATE CONTROL HANDLER
 * This handler should be called to request an update to a control, including the
 * value, the formula or the initilializer.
 * 
 * Event object format:
 * { 
 *	control: [control], \
 *	html: [html text],
 *	onLoadBody: [function body text],
 *	supplementalCode: [supplementalCode],
 *	css: [css text],
 * }
 */
visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER = "updateControl";

/** control UPDATED EVENT
 * This listener event is fired when after a control is updated, to be used to respond
 * to the control update such as to update the UI.
 * 
 * Event control Format:
 * [control event object]
 */
visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT = "controlUpdated";

visicomp.core.updatecontrol.fireUpdatedEvent = function(control) {
    var workspace = control.getWorkspace();
    workspace.dispatchEvent(visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT,control);
}

/** This is the listener for the update control event. */
visicomp.core.updatecontrol.onUpdateObject = function(updateData) {
    var returnValue;
    
    try {
		//update control content
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

    
/** This method subscribes to the update control handler event */
visicomp.core.updatecontrol.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER, 
            visicomp.core.updatecontrol.onUpdateObject);
}


/** This method updates the data for the control. It should be implemented by
 * the control.
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



