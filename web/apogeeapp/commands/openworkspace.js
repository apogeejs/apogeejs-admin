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

//NO UNDO FOR OPEN WORKSPACE
//openworkspace.createUndoCommand = function(workspaceManager,commandData) {

openworkspace.executeCommand = function(nullWorkspaceManager,commandData,asynchOnComplete) {
        //app,workspaceText,fileMetadata) {
    var synchCommandResult = {};
    
    try {

//I should verify the file type and format!  

        //create the workspace UI (this does not create several child objects in it)
        var app = Apogee.getInstance();
        var workspaceManager = new WorkspaceManager(app);
        synchCommandResult.target = workspaceManager;
        synchCommandResult.parent = app;
        synchCommandResult.action = "created";

        workspaceManager.setFileMetadata(commandData.fileMetadata);

        //open the reference entries - this has a synch and asynch part.
        var referencesJson = commandData.workspaceJson.references;
        let referenceManager = workspaceManager.getReferenceManager();
        var {entriesCommandResultList, openEntriesPromise} = referenceManager.openReferenceEntries(referencesJson);
        //save the entries create results to the synchronous command result
        synchCommandResult.childCommandResults = entriesCommandResultList;

        //set up asynchronouse part of loading.
        var doReferenceLoad = openEntriesPromise.then( asynchCommandResult => {
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        })
    	
        //if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            let asynchCommandResult = workspaceManager.load(commandData.workspaceJson);
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        //This will handle a unknown error om the asynchloading
        var onLoadError = function(error) {

            //publish event
            let errorMsg = error.message ? error.message : error.toString(); 
            let asynchCommandResult = {};
            asynchCommandResult.alertMsg = "Error loading workspace: " + errorMsg;
            asynchCommandResult.cmdDone = false;
            asynchCommandResult.target = workspaceManager;
            asynchCommandResult.action = "updated";
            
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        //load references and then workspace
        doReferenceLoad.then(doWorkspaceLoad).catch(onLoadError);
        synchCommandResult.pending = true;

        synchCommandResult.cmdDone = true;
    }
    catch(error) {
        if(error.stack) console.error(error.stack);

        //unkown error
        synchCommandResult.alertMsg = "Error creating workspace: " + error.message;
        synchCommandResult.cmdDone = false;
        synchCommandResult.targetIdentifier = "workspace";
        synchCommandResult.action = "created";
    }
    
    return synchCommandResult;
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

let WORKSPACE_LOADED_COMMAND_INFO = {
    "type": "openWorkspace_workspaceLoaded",
    "targetType": "workspace",
    "event": "updated",
}

CommandManager.registerCommand(openworkspace);



