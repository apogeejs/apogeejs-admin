/** This namespace contains functions to process an create a folder.  */
visicomp.core.createfolder = {};

/** PACKAGE CREATED EVENT
 * This listener event is fired when after a folder is created, to be used to respond
 * to a new folder such as to update the UI.
 * 
 * Event object Format:
 * [folder]
 */
visicomp.core.createfolder.PACKAGE_CREATED_EVENT = "folderCreated";


/** This is the listener for the create folder event. */
visicomp.core.createfolder.createFolder = function(parent,name) {
	var returnValue;
    
    try {
		//create folder
       	var workspace = parent.workspace;

		var folder = new visicomp.core.Folder(workspace,name);
        if(parent) {
            parent.addChild(folder);
        }
        
        //do any updates to other objects because of the added obejct
        workspace.updateForAddedVariable(folder);
        
		//dispatch event
		workspace.dispatchEvent(visicomp.core.createfolder.PACKAGE_CREATED_EVENT,folder);

		//return success
		returnValue = {"success":true, "folder":folder};
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

