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

addlink.createUndoCommand = function(workspaceUI,commandData) {
    var undoCommandJson = {};
    undoCommandJson.type = "deleteLink";
    undoCommandJson.entryType = commandData.entryType;
    undoCommandJson.url = commandData.url;
    return undoCommandJson;
}

addlink.executeCommand = function(workspaceUI,commandData,asynchOnComplete) {
    
    var synchCommandResult = {};

    try {
        var referenceManager = workspaceUI.getReferenceManager();
        synchCommandResult = referenceManager.createEntry(workspaceUI,commandData.entryType);
        var referenceEntry = synchCommandResult.target;
        var promise = referenceEntry.loadEntry(commandData);

        promise.then( asynchCommandResult => {
                if(asynchOnComplete) {
                    asynchOnComplete(asynchCommandResult);
                }
            })
            .catch( errorMsg => {
                if(asynchOnComplete) {
                    //unknown exception - this hopefully won't happen
                    let asynchCommandResult = {};
                    asynchCommandResult.alertMsg("Unknown exception in link processing: " + errorMsg);
                    asynchCommandResult.cmdDone = false;
                    asynchCommandResult.target = referenceEntry;
                    asynchCommandResult.type = "updated";
                    asynchOnComplete(asynchCommandResult);
                }
            });
    }
    catch(error) {
        //unknown exception
        synchCommandResult.alertMsg = "Unknown exception in creating link: " + error.message;
        synchCommandResult.cmdDone = false;
        synchCommandResult.parent = referenceManager;
        synchCommandResult.type = "created";
    }
    
    return synchCommandResult;
}

addlink.commandInfo = {
    "type": "addLink",
    "targetType": "link",
    "event": "created",
    "isAsynch": true
}

CommandManager.registerCommand(addlink);











