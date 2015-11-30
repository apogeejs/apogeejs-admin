/** This namespace contains functions to process an create a control. */
visicomp.core.createcontrol = {};

/** CREATE CONTROL HANDLER
 * This handler should be called to request a control be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	folder: [folder]
 * }
 */
visicomp.core.createcontrol.CREATE_CONTROL_HANDLER = "createControl";

/** CONTROL CREATED EVENT
 * This listener event is fired when after a control is created, to be used to respond
 * to a new control such as to update the UI.
 * 
 * Event object Format:
 * [control]
 */
visicomp.core.createcontrol.CONTROL_CREATED_EVENT = "controlCreated";


/** This is the listener for the create control event. */
visicomp.core.createcontrol.onCreateControl = function(event) {
	var returnValue;
    
    try {
		//create control
		var name = event.name;
		var folder = event.folder;
        var workspace = folder.getWorkspace();
        
		var control = new visicomp.core.Control(workspace,name);
		folder.addChild(control);

		//initialize data
		control.setData("");

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createcontrol.CONTROL_CREATED_EVENT,control);

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

/** This method subscribes to the udpate control handler event */
visicomp.core.createcontrol.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createcontrol.CREATE_CONTROL_HANDLER, 
            visicomp.core.createcontrol.onCreateControl);
}

