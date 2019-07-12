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


apogeeapp.app.updatelink.createUndoCommand = function(workspaceUI,commandJson) {
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.updatelink.COMMAND_TYPE;
    
    undoCommandJson.entryType = commandJson.entryType;
    undoCommandJson.oldUrl = commandJson.newUrl;
    
    if(commandJson.newUrl != commandJson.oldUrl) undoCommandJson.newUrl = commandJson.oldUrl;
    
    if(commandJson.newNickname) {
        //look up the pre-command entry (we change back gto this)
        var referenceManager = workspaceUI.getReferenceManager();
        var referenceEntry = referenceManager.lookupEntry(commandJson.entryType,commandJson.oldUrl);
        if(commandJson.newNickname != referenceEntry.getNickname()) undoCommandJson.newNickname = referenceEntry.getNickname();
    }
    
    return undoCommandJson;
}

apogeeapp.app.updatelink.executeCommand = function(workspaceUI,commandJson) {
    
    var commandResult = {};

    try {
        var referenceManager = workspaceUI.getReferenceManager();
        
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(commandJson.entryType,commandJson.oldUrl);
        
        if(referenceEntry) {
            //update entry
            referenceEntry.updateData(commandJson.newUrl,commandJson.newNickname);
            
            //TODO - think about how to add result one link updaye completion
            
            commandResult.cmdDone = true;
        }
        else {
            //entry not found
            commandResult.alertMsg("Link entry to update not found!");
            commandResult.cmdDone = false;
        }
    }
    catch(error) {
        //unkown error
        commandResult.alertMsg("Error adding link: " + error.message);
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}


apogeeapp.app.updatelink.COMMAND_TYPE = "updateLink";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.updatelink);











