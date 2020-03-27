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
    undoCommandJson.nickname = nickname;
    
    return undoCommandJson;
}

deletelink.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult;

    try {
        var referenceManager = workspaceManager.getReferenceManager();
        commandResult = referenceManager.removeEntry(commandData.entryType,commandData.url);
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unkown error
        commandResult = {}
        commandResult.errorMsg = "Error deleting link: " + error.message;
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}

deletelink.commandInfo = {
    "type": "deleteLink",
    "targetType": "link",
    "event": "deleted"
}

CommandManager.registerCommand(deletelink);











