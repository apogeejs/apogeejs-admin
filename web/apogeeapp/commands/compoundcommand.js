import CommandManager from "/apogeeapp/commands/CommandManager.js";

let compoundcommand = {};

//=====================================
// Command Object
//=====================================

compoundcommand.createUndoCommand = function(workspaceManager,commandData) {
    let undoCommandJson = {};
    undoCommandJson.type = compoundcommand.commandInfo.type;
    undoCommandJson.childCommands = [];
    
    //add the child undo commands in the reverse order
    for(var i = commandData.childCommands.length-1; i >= 0; i--) {
        let childCommandJson = commandData.childCommands[i];
        let childCommandObject = CommandManager.getCommandObject(childCommandJson.type);
        let childUndoCommandJson = childCommandObject.createUndoCommand(workspaceManager,childCommandJson);
        undoCommandJson.childCommands.push(childUndoCommandJson);
    }
    
    return undoCommandJson;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
compoundcommand.executeCommand = function(workspaceManager,commandData) {
    
    let commandResult = {};
    commandResult.childResults = [];
    
    //add the child undo commands in the reverse order
    for(var i = 0; i < commandData.childCommands.length; i++) {
        let childCommandJson = commandData.childCommands[i];
        let childCommandObject = CommandManager.getCommandObject(childCommandJson.type);
        let childCommandResult = childCommandObject.executeCommand(workspaceManager,childCommandJson);
        commandResult.childResults.push(childCommandResult);
    }

    //i need to handle error cases!
    commandResult.cmdDone = true;
    
    return commandResult;
}

compoundcommand.commandInfo = {
    "type": "compoundCommand",
}

CommandManager.registerCommand(compoundcommand);


