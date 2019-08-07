import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import Apogee from "/apogeeapp/app/Apogee.js";
import WorkspaceUI from "/apogeeapp/app/WorkspaceUI.js";

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
    
    try {
        
        //make the workspace ui
        var workspaceUI = new WorkspaceUI();
        workspaceUIAdded = Apogee.getInstance().setWorkspaceUI(workspaceUI);
        
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
        commandResult.alertMsg = "Error adding link: " + error.message;
        commandResult.cmdDone = false;
    }
    
    return commandResult;
}

createworkspace.COMMAND_TYPE = "createWorkspace";

CommandManager.registerCommand(createworkspace);

