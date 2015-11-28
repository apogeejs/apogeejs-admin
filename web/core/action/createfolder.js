/** This namespace contains functions to process an create a folder.  */
visicomp.core.createfolder = {};

/** CREATE PACKAGE HANDLER
 * This handler should be called to request a folder be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	workspace: [workspace]
 * }
 */
visicomp.core.createfolder.CREATE_PACKAGE_HANDLER = "createFolder";

/** PACKAGE CREATED EVENT
 * This listener event is fired when after a folder is created, to be used to respond
 * to a new folder such as to update the UI.
 * 
 * Event object Format:
 * [folder]
 */
visicomp.core.createfolder.PACKAGE_CREATED_EVENT = "folderCreated";


/** This is the listener for the create folder event. */
visicomp.core.createfolder.onCreateFolder = function(event) {
	var returnValue;
    
    try {
		//create folder
		var name = event.name;
		var parent = event.parent;
		var workspace = event.workspace;

		var folder = new visicomp.core.Folder(workspace,name);
        if(parent) {
            parent.addChild(folder);
        }
		//dispatch event
		workspace.dispatchEvent(visicomp.core.createfolder.PACKAGE_CREATED_EVENT,folder);

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
    
/** This method subscribes to the create folder handler event */
visicomp.core.createfolder.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createfolder.CREATE_PACKAGE_HANDLER, 
            visicomp.core.createfolder.onCreateFolder);
}

