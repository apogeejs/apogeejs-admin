/** This namespace contains functions to process an create a worksheet. */
visicomp.core.createworksheet = {};

/** CREATE WORKSHEET HANDLER
 * This handler should be called to request a worksheet be created.
 * 
 * Event object format:  //future add other options
 * { 
 *	name: [string]
 *	workbook: [workbook]
 * }
 */
visicomp.core.createworksheet.CREATE_WORKSHEET_HANDLER = "createWorksheet";

/** WORKSHEET CREATED EVENT
 * This listener event is fired when after a worksheet is created, to be used to respond
 * to a new worksheet such as to update the UI.
 * 
 * Event object Format:
 * [worksheet]
 */
visicomp.core.createworksheet.WORKSHEET_CREATED_EVENT = "worksheetCreated";


/** This is the listener for the create worksheet event. */
visicomp.core.createworksheet.onCreateWorksheet = function(event) {
    //create worksheet
    var name = event.name;
    var workbook = event.workbook;
    var worksheet = new visicomp.core.Worksheet(name);
    workbook.addWorksheet(worksheet);
	
    //dispatch event
    var eventManager = workbook.getEventManager();
    eventManager.dispatchEvent(visicomp.core.createworksheet.WORKSHEET_CREATED_EVENT,worksheet);
	
    //return success
    return {
        "success":true
    };
}
    
/** This method subscribes to the create worksheet handler event */
visicomp.core.createworksheet.initHandler = function(eventManager) {
    eventManager.addHandler(visicomp.core.createworksheet.CREATE_WORKSHEET_HANDLER, 
            visicomp.core.createworksheet.onCreateWorksheet);
}

