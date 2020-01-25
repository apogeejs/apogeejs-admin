import CommandManager from "/apogeeapp/commands/CommandManager.js";
import Apogee from "/apogeeapp/Apogee.js";
import WorkspaceUI from "/apogeeapp/WorkspaceUI.js";

/** Create Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"createWorkspace",
 * }
 */ 
let createworkspace = {};

//=====================================
// Command Object
//=====================================

//NO UNDO FOR CREATE WORKSPACE
//createworkspace.createUndoCommand = function(workspaceUI,commandData) {

/** Workspace UI parameter is not applicable. */
createworkspace.executeCommand = function(unpopulatedWorkspaceUI,commandData) {

    var commandResult = {};
    var workspaceUIAdded;

    var app = Apogee.getInstance();
    
    try {
        
        //make the workspace ui
        var workspaceUI = new WorkspaceUI();
        workspaceUIAdded = app.setWorkspaceUI(workspaceUI);
        
        //load
        workspaceUI.load();
        
        commandResult.cmdDone = true;
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        if(workspaceUIAdded) {
            app.clearWorkspaceUI();
        }
        
        //unkown error
        commandResult.alertMsg = "Error creating workspace: " + error.message;
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}

createworkspace.commandInfo = {
    "type": "createWorkspace",
    "targetType": "workspace",
    "event": "created"
}

CommandManager.registerCommand(createworkspace);

