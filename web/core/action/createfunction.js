/** This namespace contains functions to process an create a function. */
visicomp.core.createfunction = {};

/** FUNCTION CREATED EVENT
 * This listener event is fired when after a function is created, to be used to respond
 * to a new function such as to update the UI.
 * 
 * Event object Format:
 * [function]
 */
visicomp.core.createfunction.FUNCTION_CREATED_EVENT = "functionCreated";


/** This is the listener for the create function event. */
visicomp.core.createfunction.createFunction = function(folder,name,argParens) {
	var returnValue;
    
    try {
		//create functionObject
        var workspace = folder.getWorkspace();
        
		var functionObject = new visicomp.core.FunctionTable(workspace,name,argParens);
		folder.addChild(functionObject);

		//initialize data
		functionObject.setData("");
        
        //do any updates to other objects because of the added obejct
        workspace.updateForAddedVariable(functionObject);

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createfunction.FUNCTION_CREATED_EVENT,functionObject);

		//return success
		returnValue = {"success":true, "functionObject":functionObject};
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

