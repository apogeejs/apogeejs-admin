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
        var referenceEntry = referenceManager.createEntry(commandData.entryType);
        var promise = referenceEntry.loadEntry(commandData);

        promise.then( () => {
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
                    asynchCommandResult.alertMsg("Error adding link: " + errorMsg);
                    asynchCommandResult.cmdDone = true;
                    asynchCommandResult.target = referenceEntry;
                    asynchCommandResult.type = "updated";
                    asynchOnComplete(asynchCommandResult);
                }
            });
        
        //link created, will load asynchronously
        synchCommandResult.cmdDone = true;
        synchCommandResult.target = referenceEntry;
        synchCommandResult.parent = referenceManager;
        synchCommandResult.type = "created";
    }
    catch(error) {
        synchCommandResult.alertMsg = "Error adding link: " + error.message;
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











