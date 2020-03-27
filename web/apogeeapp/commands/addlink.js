import CommandManager from "/apogeeapp/commands/CommandManager.js";

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
let addlink = {};

//=====================================
// Command Object
//=====================================

addlink.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = "deleteLink";
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    return undoCommandJson;
}

addlink.executeCommand = function(workspaceManager,commandData) {
    
    var commandResult = {};

    try {
        //synchronous reference entry creation
        var referenceManager = workspaceManager.getReferenceManager();
        commandResult = referenceManager.createEntry(commandData);
        var referenceEntry = synchCommandResult.target;

        //this will trigger an asynchrnous command to update the status on loading the ref entry
        referenceEntry.loadEntry(workpaceManager);
    }
    catch(error) {
        //unknown exception
        commandResult.errorMsg = "Unknown exception in creating link: " + error.message;
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}

addlink.commandInfo = {
    "type": "addLink",
    "targetType": "link",
    "event": "created"
}

CommandManager.registerCommand(addlink);











