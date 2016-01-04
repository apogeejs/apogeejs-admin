/** This namespace contains functions to process an create a worksheet.  */
visicomp.core.createworksheet = {};

/** WORKSHEET CREATED EVENT
 * This listener event is fired when after a worksheet is created, to be used to respond
 * to a new worksheet such as to update the UI.
 * 
 * Event object Format:
 * [worksheet]
 */
visicomp.core.createworksheet.WORKSHEET_CREATED_EVENT = "worksheetCreated";


/** This is the listener for the create wprksheet event. */
visicomp.core.createworksheet.createWorksheet = function(parent,name) {
	var returnValue;
    
    try {
		//create worksheet
       	var workspace = parent.workspace;

		var worksheet = new visicomp.core.Worksheet(workspace,name,parent);
        
        //do any updates to other objects because of the added obejct
        workspace.updateForAddedVariable(worksheet.getExternalFolder());
        
		//dispatch event
		workspace.dispatchEvent(visicomp.core.createworksheet.WORKSHEET_CREATED_EVENT,worksheet);

		//return success
		returnValue = {"success":true, "worksheet":worksheet};
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

