/** Delete Link Command
 *
 * Command JSON format:
 * {
 *   "type":"deleteLink",
 *   "entryType":(entry type),
 *   "url":(url)
 * }
 */ 
apogeeapp.app.deletelink = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.deletelink.createUndoCommand = function(workspaceUI,commandData) {
    
    var referenceManager = workspaceUI.getReferenceManager();
    var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
    var nickname = referenceEntry.getNickname();
    
    var undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.addlink.COMMAND_TYPE;
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    if(nickname) undoCommandJson.nickname = nickname;
    
    return undoCommandJson;
}

apogeeapp.app.deletelink.executeCommand = function(workspaceUI,commandData) {
    
    var commandResult = {};

    try {
        var referenceManager = workspaceUI.getReferenceManager();
        
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
        if(referenceEntry) {
            //update entry
            referenceEntry.remove();
            
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

apogeeapp.app.deletelink.COMMAND_TYPE = "deleteLink";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.deletelink);











