/** Create Workspace Command
 *
 * Command JSON format:
 * {
 *   "type":"createWorkspace",
 * }
 */ 
apogeeapp.app.createworkspace = {};

//=====================================
// Command Object
//=====================================

//NO UNDO FOR CREATE WORKSPACE
//apogeeapp.app.createworkspace.createUndoCommand = function(workspaceUI,commandData) {

/** Workspace UI parameter is not applicable. */
apogeeapp.app.createworkspace.executeCommand = function(unpopulatedWorkspaceUI,commandData) {

    var commandResult = {};
    var workspaceUIAdded;
    
    try {
        
        //make the workspace ui
        var workspaceUI = new apogeeapp.app.WorkspaceUI();
        workspaceUIAdded = apogeeapp.app.Apogee.getInstance().setWorkspaceUI(workspaceUI);
        
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

apogeeapp.app.createworkspace.COMMAND_TYPE = "createWorkspace";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.createworkspace);

