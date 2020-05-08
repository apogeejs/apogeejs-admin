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
    var referenceManager = workspaceManager.getMutableReferenceManager();
    
    //lookup entry
    let referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
    if(!referenceEntry) throw new Error("Reference entry not found. refEntryId: " + refEntryId);

    referenceEntry.removeEntry();
    referenceManager.unregisterRefEntry(referenceEntry);
}

deletelink.commandInfo = {
    "type": "deleteLink",
    "targetType": "link",
    "event": "deleted"
}

CommandManager.registerCommand(deletelink);











