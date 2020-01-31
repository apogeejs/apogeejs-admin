import CommandManager from "/apogeeapp/commands/CommandManager.js";
import Apogee from "/apogeeapp/Apogee.js";
import WorkspaceUI from "/apogeeapp/WorkspaceUI.js";

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
//openworkspace.createUndoCommand = function(workspaceUI,commandData) {

openworkspace.executeCommand = function(nullWorkspaceUI,commandData,asynchOnComplete) {
        //app,workspaceText,fileMetadata) {
    var synchCommandResult = {};
    
    var app = Apogee.getInstance();
    
    try {

//I should verify the file type and format!  

        //create the workspace UI (this does not create several child objects in it)
        var workspaceUI = new WorkspaceUI();
        synchCommandResult.target = this.workspaceUI;
        synchCommandResult.action = "created";

        workspaceUI.setFileMetadata(commandData.fileMetadata);

        //initialize the workspace - this returns command results for creating the reference management objects
        workspaceUI.init(this,this.appView);

        //open the reference entries - this has a synch and asynch part.
        var referencesJson = commandData.workspaceJson.references;
        let referenceManager = workspaceUI.getReferenceManager();
        var {entriesCommandResultList, openEntriesPromise} = referenceManager.openReferenceEntries(workspaceUI,referencesJson);
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
            let asynchCommandResult = workspaceUI.load(commandData.workspaceJson);
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
            asynchCommandResult.target = workspaceUI;
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



