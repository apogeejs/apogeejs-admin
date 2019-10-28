import CommandManager from "/apogeeapp/app/commands/CommandManager.js";
import Apogee from "/apogeeapp/app/Apogee.js";

let closeworkspace = {};

//=====================================
// Action
//=====================================

//NO UNDO FOR CLOSE WORKSPACE
//closeworkspace.createUndoCommand = function(workspaceUI,commandData) {

closeworkspace.executeCommand = function(workspaceUI,commandData) {
    var workspace = workspaceUI.getWorkspace();
    
    var workspaceUIRemoved = false;
    
    try {
        
        workspaceUIRemoved = Apogee.getInstance().clearWorkspaceUI();
        
        workspaceUI.close();
        workspace.onClose();
    }
    catch(error) {
        if(error.stack) console.error(error.stack);
        
        var isFatal = !workspaceUIRemoved;
        var errorMsg = "Error closeing workspace: " + error.message;
        CommandManager.errorAlert(errorMsg,isFatal);
    }
    
    return workspaceUIRemoved;
}

closeworkspace.COMMAND_TYPE = "closeWorkspace";

CommandManager.registerCommand(closeworkspace);




