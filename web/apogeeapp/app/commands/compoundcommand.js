

apogeeapp.app.compoundcommand = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.compoundcommand.createUndoCommand = function(workspaceUI,commandJson) {
    let undoCommandJson = {};
    undoCommandJson.type = apogeeapp.app.compoundcommand.COMMAND_TYPE;
    undoCommandJson.childCommands = [];
    
    //add the child undo commands in the reverse order
    for(var i = commandJson.childCommands.length-1; i >= 0; i--) {
        let childCommandJson = commandJson.childCommands[i];
        let childCommandObject = CommandManager.getCommandObject(childCommandJson.type);
        let childUndoCommandJson = childCommandObject.createUndoCommand(workspaceUI,childCommandJson);
        undoCommandJson.childCommands.push(childUndoCommandJson);
    }
    
    undoCommandJson.cmdDone = true;
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.compoundcommand.executeCommand = function(workspaceUI,commandJson) {
    
    let commandResult = {};
    commandResult.childResults = [];
    
    //add the child undo commands in the reverse order
    for(var i = 0; i >= commandJson.childCommands.length; i++) {
        let childCommandJson = commandJson.childCommands[i];
        let childCommandObject = CommandManager.getCommandObject(childCommandJson.type);
        let childCommandResult = childCommandObject.executeCommand(workspaceUI,childCommandJson);
        commandResult.childResults(childCommandResult);
    }
    
    return commandResult;
}

apogeeapp.app.compoundcommand.COMMAND_TYPE = "compoundCommand";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.compoundcommand);


