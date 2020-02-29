import CommandManager from "/apogeeapp/commands/CommandManager.js";
import Apogee from "/apogeeapp/Apogee.js";
import WorkspaceManager from "/apogeeapp/WorkspaceManager.js";

/** Open Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"openWorkspace",
 *   "workspaceJson":(workspace JSON),
 *   "fileMetadata":(file metadata)
 * }
 */ 
let openworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR OPEN Workspace
//openworkspace.createUndoCommand = function(workspaceManager,commandData) {

openworkspace.executeCommand = function(nullWorkspaceManager,commandData,asynchOnComplete) {
    
    try {

        //create the workspace manager (this does not create several child objects in it)
        var app = Apogee.getInstance();
        var workspaceManager = new WorkspaceManager(app);

        let {synchCommandResult,loadLinksPromise,codeLoadFunction} = workspaceManager.load(commandData.workspaceJson,commandData.fileMetadata);

        //create a function to report the results of the promises
        let reportResults = asynchCommandResult => {
            if(asynchOnComplete) asynchOnComplete(asynchCommandResult);
        }

        //This will handle a unknown error om the asynchloading 
        var onLoadError = function(error) {
            if(error.stack) console.error(error.stack);
            let errorMsg = error.message ? error.message : error.toString(); 
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.alertMsg = "Error loading workspace: " + errorMsg;
                asynchCommandResult.cmdDone = false;
                asynchOnComplete(asynchCommandResult);
            }
        }

        //construct the reference load promise, depending on whether we have any links to load.
        let referenceLoadPromise = loadLinksPromise ? loadLinksPromise.then(reportResults) : Promise.resolve();
        
        //load references and then model
        referenceLoadPromise.then(codeLoadFunction).then(reportResults).catch(onLoadError);

        return synchCommandResult;

    }
    catch(error) {
        if(error.stack) console.error(error.stack);

        //unkown error
        let synchCommandResult = {};
        synchCommandResult.errorMsg = "Error creating workspace: " + error.message;
        synchCommandResult.cmdDone = false;
        return synchCommandResult;
    }
}

openworkspace.commandInfo = {
    "type": "openWorkspace",
    "targetType": "workspace",
    "event": "created",
    "isAsynch": true
}

//additional asynch command info
let REFERENCES_LOADED_COMMAND_INFO = {
    "type": "openWorkspace_referencesLoaded",
    "targetType": "workspace",
    "event": "updated",
}

let MODEL_LOADED_COMMAND_INFO = {
    "type": "openWorkspace_modelLoaded",
    "targetType": "workspace",
    "event": "updated",
}

CommandManager.registerCommand(openworkspace);



