/** This namespace contains functions to process an create a package. */
visicomp.core.createpackage = {};

/** CREATE WORKSHEET HANDLER
 * This handler should be called to request a package be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	workspace: [workspace]
 * }
 */
visicomp.core.createpackage.CREATE_WORKSHEET_HANDLER = "createPackage";

/** WORKSHEET CREATED EVENT
 * This listener event is fired when after a package is created, to be used to respond
 * to a new package such as to update the UI.
 * 
 * Event object Format:
 * [package]
 */
visicomp.core.createpackage.WORKSHEET_CREATED_EVENT = "packageCreated";


/** This is the listener for the create package event. */
visicomp.core.createpackage.onCreatePackage = function(event) {
    //create package
    var name = event.name;
	var parent = event.parent;
    var workspace = event.workspace;
    var package = new visicomp.core.Package(name,workspace);
	
	if(parent) {
		parent.addChild(package);
	}
	else {
		workspace.setRootPackage(package);
	}
	
    //dispatch event
    var eventManager = workspace.getEventManager();
    eventManager.dispatchEvent(visicomp.core.createpackage.WORKSHEET_CREATED_EVENT,package);
	
    //return success
    return {
        "success":true
    };
}
    
/** This method subscribes to the create package handler event */
visicomp.core.createpackage.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createpackage.CREATE_WORKSHEET_HANDLER, 
            visicomp.core.createpackage.onCreatePackage);
}

