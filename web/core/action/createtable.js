/** This namespace contains functions to process an create a table. */
visicomp.core.createtable = {};

/** TABLE CREATED EVENT
 * This listener event is fired when after a table is created, to be used to respond
 * to a new table such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.createtable.TABLE_CREATED_EVENT = "tableCreated";


/** This is the listener for the create table event. */
visicomp.core.createtable.createTable = function(folder,name) {
	var returnValue;
    
    try {
		//create table
        var workspace = folder.getWorkspace();
        
		var table = new visicomp.core.Table(workspace,name);
		folder.addChild(table);

		//initialize data
		table.setData("");

		//dispatch event
		workspace.dispatchEvent(visicomp.core.createtable.TABLE_CREATED_EVENT,table);

		//return success
		returnValue = {"success":true, "table":table};
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

