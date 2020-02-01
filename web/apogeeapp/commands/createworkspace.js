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
    
    try {
        
        //make the workspace ui
        let app = Apogee.getInstance();
        var workspaceUI = new WorkspaceUI(app);
        commandResult.target = workspaceUI;
        commandResult.parent = app;
        commandResult.action = "created";
        
        //load
        let childCommandResult = workspaceUI.load(commandData.workspaceJson);
        commandResult.childCommandResults = [childCommandResult];
        
        commandResult.cmdDone = true;
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        //unkown error
        commandResult.alertMsg = "Error creating workspace: " + error.message;
        commandResult.cmdDone = false;
        commandResult.targetIdentifier = "workspace";
        commandResult.action = "created";
    }
    
    return commandResult;
}

createworkspace.commandInfo = {
    "type": "createWorkspace",
    "targetType": "workspace",
    "event": "created"
}

CommandManager.registerCommand(createworkspace);

