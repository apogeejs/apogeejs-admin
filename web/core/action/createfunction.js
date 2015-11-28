/** This namespace contains functions to process an create a function. */
visicomp.core.createfunction = {};

/** CREATE FUNCTION HANDLER
 * This handler should be called to request a function be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	package: [package]
 * }
 */
visicomp.core.createfunction.CREATE_FUNCTION_HANDLER = "createFunction";

/** FUNCTION CREATED EVENT
 * This listener event is fired when after a function is created, to be used to respond
 * to a new function such as to update the UI.
 * 
 * Event object Format:
 * [function]
 */
visicomp.core.createfunction.FUNCTION_CREATED_EVENT = "functionCreated";


/** This is the listener for the create function event. */
visicomp.core.createfunction.onCreateFunction = function(event) {
	var returnValue;
    
    try {
		//create functionObject
		var name = event.name;
		var argParens = event.argParens
		var package = event.package;
        var workspace = package.getWorkspace();
        
		var functionObject = new visicomp.core.FunctionTable(workspace,name,argParens);
		package.addChild(functionObject);

		//initialize data
		functionObject.setData("");

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createfunction.FUNCTION_CREATED_EVENT,functionObject);

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

/** This method subscribes to the udpate function handler event */
visicomp.core.createfunction.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createfunction.CREATE_FUNCTION_HANDLER, 
            visicomp.core.createfunction.onCreateFunction);
}

