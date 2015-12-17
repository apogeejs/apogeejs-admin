/** This namespace contains functions to process an create a resource. */
visicomp.core.createresource = {};

/** RESOURCE CREATED EVENT
 * This listener event is fired when after a resource is created, to be used to respond
 * to a new resource such as to update the UI.
 * 
 * Event object Format:
 * [resource]
 */
visicomp.core.createresource.RESOURCE_CREATED_EVENT = "resourceCreated";


/** This is the listener for the create resource event. */
visicomp.core.createresource.createResource = function(folder,name,resourceProcessor) {
	var returnValue;
    
    try {
		//create resource
        var workspace = folder.getWorkspace();
        
		var resource = new visicomp.core.Resource(workspace,name,resourceProcessor);
		folder.addChild(resource);

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createresource.RESOURCE_CREATED_EVENT,resource);

		//return success
		returnValue = {"success":true, "resource":resource};
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

