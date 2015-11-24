/** This namespace contains functions to process an create a table. */
visicomp.core.createtable = {};

/** CREATE TABLE HANDLER
 * This handler should be called to request a table be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	package: [package]
 * }
 */
visicomp.core.createtable.CREATE_TABLE_HANDLER = "createTable";

/** TABLE CREATED EVENT
 * This listener event is fired when after a table is created, to be used to respond
 * to a new table such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.createtable.TABLE_CREATED_EVENT = "tableCreated";


/** This is the listener for the create table event. */
visicomp.core.createtable.onCreateTable = function(event) {
	var returnValue;
    
    try {
		//create table
		var name = event.name;
		var package = event.package;
		var table = new visicomp.core.Table(name);
		package.addChild(table);

		//initialize data
		table.setData("");

		//dispatch event
		var eventManager = package.getWorkspace().getEventManager();
		eventManager.dispatchEvent(visicomp.core.createtable.TABLE_CREATED_EVENT,table);

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

/** This method subscribes to the udpate table handler event */
visicomp.core.createtable.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createtable.CREATE_TABLE_HANDLER, 
            visicomp.core.createtable.onCreateTable);
}

