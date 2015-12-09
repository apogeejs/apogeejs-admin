/** This namespace contains functions to process an update to an control
 * which inherits from the FunctionBase component. */
visicomp.core.updatecontrol = {};

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
visicomp.core.updatecontrol.updateObject = function(control,html,onLoadBody,supplementalCode,css) {
    var returnValue;
    
    try {
		//update control content
        control.setContent(html,onLoadBody,supplementalCode,css);
        
        //fire this for the change in value
        visicomp.core.updatecontrol.fireUpdatedEvent(control);

		//return success
		returnValue = {"success":true};
	}
	finally {
        //for now we will not catch errors but let the broswer take care of them
        //in the future we want the debugger handling for user code errors.
        if(!returnValue) {
            alert("There was an error. See the browser debugger.");
            returnValue = {"success":false};
        }
    }
    
    return returnValue;
}



