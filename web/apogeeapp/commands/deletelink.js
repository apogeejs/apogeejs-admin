import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** Delete Link Command
 *
 * Command JSON format:
 * {
 *   "type":"deleteLink",
 *   "entryType":(entry type),
 *   "url":(url)
 * }
 */ 
let deletelink = {};

//=====================================
// Command Object
//=====================================

deletelink.createUndoCommand = function(workspaceManager,commandData) {
    
    var nickname;

    var referenceManager = workspaceManager.getReferenceManager();
    var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
    
    if(referenceEntry) nickname = referenceEntry.getNickname();

    var undoCommandJson = {};
    undoCommandJson.type = "addLink";
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    if(nickname) undoCommandJson.nickname = nickname;
    
    return undoCommandJson;
}

deletelink.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult;

    try {
        var referenceManager = workspaceManager.getReferenceManager();
        
        //lookup entry for this reference
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
        if(referenceEntry) {
            //update entry
            commandResult = referenceEntry.remove();
        }
        else {
            //entry not found
            commandResult = {}
            commandResult.alertMsg = "Link entry to update not found!";
            commandResult.cmdDone = false;
            commandResult.action = "deleted";
        }
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unkown error
        commandResult = {}
        commandResult.alertMsg = "Error deleting link: " + error.message;
        commandResult.cmdDone = false;
        commandResult.action = "deleted";
    }
    
    return commandResult;
}

deletelink.commandInfo = {
    "type": "deleteLink",
    "targetType": "link",
    "event": "deleted"
}

CommandManager.registerCommand(deletelink);











