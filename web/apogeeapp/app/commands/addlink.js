/** Add Link Command
 *
 * Command JSON format:
 * {
 *   "type":"addLink",
 *   "entryType":(entry type),
 *   "url":(url),
 *   "nickname":(nickname - optional)
 * }
 */ 
apogeeapp.app.addlink = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.addlink.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.deletelink.COMMAND_TYPE;
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    return undoCommandJson;
}

apogeeapp.app.addlink.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var synchCommandResult = {};

    try {
        var referenceManager = workspaceUI.getReferenceManager();

        //add entry function
        var promise = referenceManager.addEntry(commandData);

        promise.then( () => {
                if(asynchOnComplete) {
                    let asynchCommandResult = {};
                    asynchCommandResult.cmdDone = true;
                    asynchOnComplete(asynchCommandResult);
                }
            })
            .catch( errorMsg => {
                if(asynchOnComplete) {
                    let asynchCommandResult = {};
                    asynchCommandResult.alertMsg("Error adding link: " + errorMsg);
                    asynchCommandResult.cmdDone = false;
                    asynchOnComplete(asynchCommandResult);
                }
            });
        
        //we don't know if we had success - think about how to do this rather than just saying true now
        synchCommandResult.cmdDone = true;
    }
    catch(error) {
        synchCommandResult.alertMsg = "Error adding link: " + error.message;
        synchCommandResult.cmdDone = false;
    }
    
    return synchCommandResult;
}


apogeeapp.app.addlink.COMMAND_TYPE = "addLink";

apogeeapp.app.addlink.isAsynch = true;

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.addlink);











