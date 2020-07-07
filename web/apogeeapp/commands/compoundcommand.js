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
        if(childUndoCommandJson) undoCommandJson.childCommands.push(childUndoCommandJson);
    }
    
    if(undoCommandJson.childCommands.length > 0) return undoCommandJson;
    else return null;
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
compoundcommand.executeCommand = function(workspaceManager,commandData) {
    //execute all child commands
    for(var i = 0; i < commandData.childCommands.length; i++) {
        let childCommandJson = commandData.childCommands[i];
        let childCommandObject = CommandManager.getCommandObject(childCommandJson.type);
        childCommandObject.executeCommand(workspaceManager,childCommandJson);
    }
}

compoundcommand.commandInfo = {
    "type": "compoundCommand",
}

CommandManager.registerCommand(compoundcommand);


