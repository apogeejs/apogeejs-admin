import CommandManager from "/apogeeapp/commands/CommandManager.js";
import Apogee from "/apogeeapp/Apogee.js";
import WorkspaceManager from "/apogeeapp/WorkspaceManager.js";

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

//NO UNDO FOR CREATE Workspace
//createworkspace.createUndoCommand = function(workspaceManager,commandData) {

/** Workspace parameter is not applicable. */
createworkspace.executeCommand = function(unpopulatedWorkspaceManager,commandData) {

    var commandResult = {};
    
    try {
        
        //make the workspace manager
        let app = Apogee.getInstance();
        var workspaceManager = new WorkspaceManager(app);
        commandResult.target = workspaceManager;
        commandResult.parent = app;
        commandResult.action = "created";
        
        //load
        let childCommandResult = workspaceManager.load(commandData.workspaceJson);
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

