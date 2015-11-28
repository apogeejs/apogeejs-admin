/** This namespace contains functions to process an create a workspace. */
visicomp.core.createworkspace = {};

/** CREATE WORKSPACE HANDLER
 * This handler should be called to request a workspace be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	eventManager: [eventManager]
 * }
 */
visicomp.core.createworkspace.CREATE_WORKSPACE_HANDLER = "createWorkspace";

/** WORKSPACE CREATED EVENT
 * This listener event is fired when after a workspace is created, to be used to respond
 * to a new workspace such as to update the UI.
 * 
 * Event object Format:
 * [workspace]
 */
visicomp.core.createworkspace.WORKSPACE_CREATED_EVENT = "workspaceCreated";


/** This is the listener for the create package event. */
visicomp.core.createworkspace.onCreateWorkspace = function(event) {
	var returnValue;
    
    try {
		//create package
		var name = event.name;
		var workspace = new visicomp.core.Workspace(name);     
        
        

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
    
/** This method subscribes to the create package handler event */
visicomp.core.createworkspace.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createworkspace.CREATE_WORKSPACE_HANDLER, 
            visicomp.core.createworkspace.onCreateWorkspace);
}

