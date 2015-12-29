/** This namespace contains functions to process an create a table. */
visicomp.core.deletechild = {};

/** TABLE CREATED EVENT
 * This listener event is fired when after a table is created, to be used to respond
 * to a new table such as to update the UI.
 * 
 * Event object Format:
 * [table]
 */
visicomp.core.deletechild.CHILD_DELETED_EVENT = "childDeleted";


/** This is the listener for the create table event. */
visicomp.core.deletechild.deleteChild = function(child) {
	var returnValue;
    
    try {
		//create table
		var fullName = child.getFullName();
		var workspace = child.getWorkspace();
		
		child.onDelete();
        
        //do any updates to other objects because of the deleted table
        workspace.updateForDeletedVariable(child);

		//dispatch event
        var data = {};
		workspace.dispatchEvent(visicomp.core.deletechild.CHILD_DELETED_EVENT,fullName);

		//return success
		returnValue = {"success":true};
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




