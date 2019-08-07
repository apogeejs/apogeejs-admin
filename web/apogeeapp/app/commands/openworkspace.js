import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import Apogee from "/apogeeapp/app/Apogee.js";
import WorkspaceUI from "/apogeeapp/app/WorkspaceUI.js";

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

openworkspace.executeCommand = function(unpopulatedWorkspaceUI,commandData,asynchOnComplete) {
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
    	
		//if we have to load links wait for them to load
		var doWorkspaceLoad = function() {
            workspaceUI.load(commandData.workspaceJson);
            workspaceUI.setFileMetadata(commandData.fileMetadata);
            
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.cmdDone = true;
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        var linkLoadError = function(errorMsg) {
            //this is just a warning - we will continue, though things may not work.
            CommandManager.errorAlert("Error loading links: " + errorMsg);
        }
        
        var workspaceLoadError = function(errorMsg) {
            app.clearWorkspaceUI();
            
            if(asynchOnComplete) {
                let asynchCommandResult = {};
                asynchCommandResult.alertMsg("Error loading workspace: " + errorMsg);
                asynchCommandResult.cmdDone = false;
                asynchOnComplete(asynchCommandResult);
            }
        }
        
        //load references and then workspace
        //on a reference error, we continue loading the workspace
        loadReferencesPromise.catch(linkLoadError).then(doWorkspaceLoad).catch(workspaceLoadError);

        synchCommandResult.cmdDone = true;
    }
    catch(error) {
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        //unkown error
        synchCommandResult.alertMsg("Error adding link: " + error.message);
        synchCommandResult.cmdDone = false;
    }
    
    return synchCommandResult;
}

openworkspace.COMMAND_TYPE = "openWorkspace";

openworkspace.isAsynch = true;

CommandManager.registerCommand(openworkspace);



