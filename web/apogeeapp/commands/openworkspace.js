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
    var workspaceUIAdded;
    var synchCommandResult = {};
    
    var app = Apogee.getInstance();
    
    try {

//I should verify the file type and format!  
        
        var workspaceUI = new WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
    
        var referencesJson = commandData.workspaceJson.references;
        var loadReferencesPromise = workspaceUI.getLoadReferencesPromise(referencesJson);
        var doReferenceLoad = loadReferencesPromise.then( () => {
            //publish result
            let asynchCommandResult = {};
            asynchCommandResult.cmdDone = true;
            asynchCommandResult.target = workspaceUI;
            asynchCommandResult.action = "updated";
            
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        })
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(commandData.workspaceJson);
            workspaceUI.setFileMetadata(commandData.fileMetadata);

            //publish result
            let asynchCommandResult = {};
            asynchCommandResult.cmdDone = true;
            asynchCommandResult.target = workspaceUI;
            asynchCommandResult.action = "updated";
            
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        var linkLoadError = function(errorMsg) {
            //this is just a warning - we will continue, though things may not work.
            CommandManager.errorAlert("Error loading links: " + errorMsg);

            //publish event
            let errorMsg = error.message ? error.message : error.toString(); 
            let asynchCommandResult = {};
            asynchCommandResult.alertMsg = "Error loading workspace links: " + errorMsg;
            asynchCommandResult.cmdDone = false;
            asynchCommandResult.target = workspaceUI;
            asynchCommandResult.action = "updated";
            
            
            if(asynchOnComplete) {
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        var workspaceLoadError = function(error) {
            app.clearWorkspaceUI();

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
        //on a reference error, we continue loading the workspace
        doReferenceLoad.catch(linkLoadError).then(doWorkspaceLoad).catch(workspaceLoadError);

        synchCommandResult.cmdDone = true;
        synchCommandResult.target = this.workspaceUI;
        synchCommandResult.action = "created";
        synchCommandResult.pending = true;
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
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



