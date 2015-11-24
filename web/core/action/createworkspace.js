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
	try {
		//create package
		var name = event.name;
		var eventManager = event.eventManager;
		var workspace = new visicomp.core.Workspace(name,eventManager);

		//dispatch event for workspace and root package
		var eventManager = workspace.getEventManager();
		eventManager.dispatchEvent(visicomp.core.createworkspace.WORKSPACE_CREATED_EVENT,workspace);
		eventManager.dispatchEvent(visicomp.core.createpackage.PACKAGE_CREATED_EVENT,workspace.getRootPackage());

		//return success
		return {
			"success":true
		};
	}
	catch(error) {
		//we need to clean up!
		
		//return failure
		return {
			"success":false,
			"msg":error.message
		}
	}
}
    
/** This method subscribes to the create package handler event */
visicomp.core.createworkspace.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createworkspace.CREATE_WORKSPACE_HANDLER, 
            visicomp.core.createworkspace.onCreateWorkspace);
}

