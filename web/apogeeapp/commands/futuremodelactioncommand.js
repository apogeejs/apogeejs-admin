import {doAction} from "/apogee/apogeeCoreLib.js";

import CommandManager from "/apogeeapp/commands/CommandManager.js";

/**
 * This command is intended to run asynchronous commands, for which no undo is given.
 * The intention is that these commands are byproducts of a different action that will be
 * undone by undoing that different action. (NEED TO THINK ABOUT HOW THIS IS GARUNTEED)
 */

let futuremodelactioncommand = {};

//=====================================
// Command Object
//=====================================

/** NO UNDO - DANGEROUS. THIS IS MEANT ONLY FOR FUTURE ACTIONS. IIF SOMEONE USES
 * IT FOR A REGULAR ACTION THEN IT WILL NOT PROPERLY BE REVERSIBLE!!!
 */
//futuremodelactioncommand.createUndoCommand = function(workspaceManager,commandData) {};

/** This method deletes the component and the underlying member. It should be passed
 *  the model and the member full name. (We delete by name and model to handle
 *  undo/redo cases where the instance of the member changes.)
 */
futuremodelactioncommand.executeCommand = function(workspaceManager,commandData) {
    
    let modelManager = workspaceManager.getMutableModelManager();
    let model = modelManager.getMutableModel();

    var actionResult = doAction(model,commandData.action);
    if(!actionResult.actionDone) {
        throw new Error("Error in model action command: " + actionResult.errorMsg);
    }
}

futuremodelactioncommand.commandInfo = {
    "type": "futureModelActionCommand",
    "targetType": "component",
    "event": "unknown :-)"
}

CommandManager.registerCommand(futuremodelactioncommand);