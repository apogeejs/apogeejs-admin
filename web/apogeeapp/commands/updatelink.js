import CommandManager from "/apogeeapp/commands/CommandManager.js";

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
let updatelink = {};


updatelink.createUndoCommand = function(workspaceManager,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = updatelink.commandInfo.type;
    
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.oldUrl = commandData.newUrl;
    
    if(commandData.newUrl != commandData.oldUrl) undoCommandJson.newUrl = commandData.oldUrl;
    
    if(commandData.newNickname !== undefined) {
        //look up the pre-command entry (we change back gto this)
        var referenceManager = workspaceManager.getReferenceManager();
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
        if((referenceEntry)&&(commandData.newNickname != referenceEntry.getNickname())) {
            undoCommandJson.newNickname = referenceEntry.getNickname();
        }
    }
    
    return undoCommandJson;
}

updatelink.executeCommand = function(workspaceManager,commandData) {
    let referenceManager = workspaceManager.getReferenceManager();
    let commandResult = referenceManager.updateEntry(commandData.entryType,commandData.oldUrl,commandData);
    return commandResult;
}

updatelink.commandInfo = {
    "type": "updateLink",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(updatelink);











