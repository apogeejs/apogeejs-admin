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


updatelink.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = updatelink.commandInfo.type;
    
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.oldUrl = commandData.newUrl;
    
    if(commandData.newUrl != commandData.oldUrl) undoCommandJson.newUrl = commandData.oldUrl;
    
    if(commandData.newNickname) {
        //look up the pre-command entry (we change back gto this)
        var referenceManager = workspaceUI.getReferenceManager();
        var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
        if((referenceEntry)&&(commandData.newNickname != referenceEntry.getNickname())) {
            undoCommandJson.newNickname = referenceEntry.getNickname();
        }
    }
    
    return undoCommandJson;
}

updatelink.executeCommand = function(workspaceUI,commandData) {
    
    var synchcommandResult = {};
    var referenceManager = workspaceUI.getReferenceManager();
    
    //lookup entry for this reference
    var referenceEntry = referenceManager.lookupEntry(commandData.entryType,commandData.oldUrl);
    
    if(referenceEntry) {
        //update entry
        let updatePromise = referenceEntry.updateData(commandData.newUrl,commandData.newNickname);

        updatePromise.then( () => {
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.cmdDone = true;
                asynchCommandResult.target = referenceEntry;
                asynchCommandResult.type = "updated";
                asynchOnComplete(asynchCommandResult);
            }
        })
        .catch( errorMsg => {
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.alertMsg("Error updating link: " + errorMsg);
                asynchCommandResult.cmdDone = true;
                asynchCommandResult.target = referenceEntry;
                asynchCommandResult.type = "updated";
                asynchOnComplete(asynchCommandResult);
            }
        });
        
        synchcommandResult.cmdDone = true;
        synchcommandResult.target = referenceEntry;
        synchcommandResult.type = "updated";
    }
    else {
        //entry not found
        synchcommandResult.alertMsg = "Link entry to update not found!";
        synchcommandResult.cmdDone = false;
        synchcommandResult.type = "updated";
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











