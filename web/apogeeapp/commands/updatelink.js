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

updatelink.executeCommand = function(workspaceManager,commandData,asynchOnComplete) {
    
    var synchcommandResult = {};
    var referenceManager = workspaceManager.getReferenceManager();
    
    //lookup entry for this reference
    var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
    
    if(referenceEntry) {
        //update entry
        let url = (commandData.newUrl !== undefined) ? commandData.newUrl : referenceEntry.getUrl();
        let nickname = (commandData.newNickname !== undefined) ? commandData.newNickname : referenceEntry.getNickname();
        let updatePromise = referenceEntry.updateData(url,nickname);

        updatePromise.then( asynchCommandResult => {
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        })
        .catch( errorMsg => {
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.alertMsg = "Unkonwn error updating link: " + errorMsg;
                asynchCommandResult.cmdDone = false;
                asynchCommandResult.target = referenceEntry;
                asynchCommandResult.action = "updated";
                asynchOnComplete(asynchCommandResult);
            }
        });
        
        synchcommandResult.cmdDone = true;
        synchcommandResult.target = referenceEntry;
        synchcommandResult.parent = referenceEntry.getReferenceList();
        synchcommandResult.action = "updated";
    }
    else {
        //entry not found
        synchcommandResult.alertMsg = "Link entry to update not found!";
        synchcommandResult.cmdDone = false;
        synchcommandResult.action = "updated";
    }
    
    return synchcommandResult;
}

updatelink.commandInfo = {
    "type": "updateLink",
    "targetType": "component",
    "event": "updated",
    "isAsynch": true
}

CommandManager.registerCommand(updatelink);











