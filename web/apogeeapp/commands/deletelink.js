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

deletelink.createUndoCommand = function(workspaceUI,commandData) {
    
    var referenceManager = workspaceUI.getReferenceManager();
    var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.url);
    var nickname = referenceEntry.getNickname();
    
    var undoCommandJson = {};
    undoCommandJson.type = "addLink";
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    if(nickname) undoCommandJson.nickname = nickname;
    
    return undoCommandJson;
}

deletelink.executeCommand = function(workspaceUI,commandData) {
    
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

deletelink.COMMAND_TYPE = "deleteLink";

CommandManager.registerCommand(deletelink);











