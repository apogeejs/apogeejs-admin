/** Update Link Command
 *
 * Command JSON format:
 * {
 *   "type":"updateLink",
 *   "entryType":(entry type),
 *   "oldUrl":(original url),
 *   "newUrl":(new url - optional),
 *   "newNickname":(new nickname - optional)
 * }
 */ 
apogeeapp.app.updatelink = {};


apogeeapp.app.updatelink.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.updatelink.COMMAND_TYPE;
    
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.oldUrl = commandData.newUrl;
    
    if(commandData.newUrl != commandData.oldUrl) undoCommandJson.newUrl = commandData.oldUrl;
    
    if(commandData.newNickname) {
        //look up the pre-command entry (we change back gto this)
        var referenceManager = workspaceUI.getReferenceManager();
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
        if(commandData.newNickname != referenceEntry.getNickname()) undoCommandJson.newNickname = referenceEntry.getNickname();
    }
    
    return undoCommandJson;
}

apogeeapp.app.updatelink.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var commandResult = {};

    try {
        var referenceManager = workspaceUI.getReferenceManager();
        
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.updateData(commandData.newUrl,commandData.newNickname);
            
            //TODO - think about how to add result one link updaye completion
            
            commandResult.cmdDone = true;
        }
        else {
            //entry not found
            commandResult.alertMsg = "Link entry to update not found!";
            commandResult.cmdDone = false;
        }
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unkown error
        commandResult.alertMsg("Error adding link: " + error.message);
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}


apogeeapp.app.updatelink.COMMAND_TYPE = "updateLink";

apogeeapp.app.updatelink.isAsynch = true;

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.updatelink);











