/** This namespace contains functions to process an create a table. */
visicomp.core.deletechild = {};

/** CREATE TABLE HANDLER
 * This handler should be called to request a table be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	package: [package]
 * }
 */
visicomp.core.deletechild.DELETE_CHILD_HANDLER = "deleteChild";

/** TABLE CREATED EVENT
 * This listener event is fired when after a table is created, to be used to respond
 * to a new table such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.deletechild.CHILD_DELETED_EVENT = "childDeleted";


/** This is the listener for the create table event. */
visicomp.core.deletechild.onDeleteChild = function(event) {
	var returnValue;
    
    try {
		//create table
		var child = event.child;
		var fullName = child.getFullName();
		var workspace = child.getWorkspace();
		
		child.onDelete();

		//dispatch event
		workspace.dispatchEvent(visicomp.core.deletechild.CHILD_DELETED_EVENT,fullName);

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
visicomp.core.deletechild.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.deletechild.DELETE_CHILD_HANDLER, 
            visicomp.core.deletechild.onDeleteChild);
}




