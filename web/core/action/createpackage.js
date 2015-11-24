/** This namespace contains functions to process an create a package. */
visicomp.core.createpackage = {};

/** CREATE PACKAGE HANDLER
 * This handler should be called to request a package be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	workspace: [workspace]
 * }
 */
visicomp.core.createpackage.CREATE_PACKAGE_HANDLER = "createPackage";

/** PACKAGE CREATED EVENT
 * This listener event is fired when after a package is created, to be used to respond
 * to a new package such as to update the UI.
 * 
 * Event object Format:
 * [package]
 */
visicomp.core.createpackage.PACKAGE_CREATED_EVENT = "packageCreated";


/** This is the listener for the create package event. */
visicomp.core.createpackage.onCreatePackage = function(event) {
	var returnValue;
    
    try {
		//create package
		var name = event.name;
		var parent = event.parent;
		var workspace = event.workspace;
		var isRoot = event.isRoot;
		var package = new visicomp.core.Package(name);

		if(isRoot) {
			parent.setRootPackage(package);
		}
		else {
			parent.addChild(package);
		}

		//dispatch event
		var eventManager = workspace.getEventManager();
		eventManager.dispatchEvent(visicomp.core.createpackage.PACKAGE_CREATED_EVENT,package);

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
visicomp.core.createpackage.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createpackage.CREATE_PACKAGE_HANDLER, 
            visicomp.core.createpackage.onCreatePackage);
}

