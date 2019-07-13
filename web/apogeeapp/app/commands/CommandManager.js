/* 
 * This class manages executing commands and storign and operating the command history for undo/redo.
 * It provides standarde error handling for the commands in addition to managing undo/redo or commands.
 * 
 * Command Structure:
 * {
 *      type - This is a string giving the command type. This will be used to dispatch
 *      the command to the proper execution function. The string should correspond to 
 *      a command that was registered with the regiter command function.  
 *     
 *     ?: setsDirty?
 *     
 *     ?: noUndo?
 *     
 *     (everything else depends on the specific command)
 * }
 * 
 * Command Object - Should be registered with "registerFunction". It should contain the following things:
 * - function executeCommand(workspaceUI,commandData) = This exectues the command and return a commandResult object.
 * - function createUnfoCommand(workspceUI,commandData) - This creates an undo command json from the given command json.
 * - string COMMAND_TYPE - This is the command type.
 *  
 * Command Result:
 * After executing a command, a commandResult is returned:
 * {
 *      cmdDone: If this is true the command was done. This implies the undo command
 *      should undo the results. If this value is false, no action was taken.
 *
 *      alertMsg - This is a message for the user after the command was executed. This
 *      is typically an error mesasge. There may still be a message if cmdDone is true, 
 *      since that does not necessarily imply the command was exectued completely
 *      as intended.
 *      
 *      isFatal - If this flag is set there was an error that may have left the 
 *      program in an inoperable or unpredictably state and the program should be
 *      aborted. 
 *      
 *      (all other data depends on the specific command)
 *
 */
apogeeapp.app.CommandManager = class {
    constructor(app) {
        this.app = app;
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. */
    executeCommand(command) {
        var workspaceUI = this.app.getWorkspaceUI();
        let commandResult;
        
        var commandObject = apogeeapp.app.CommandManager.getCommandObject(command.type);
        if(commandObject) {
            try {
                commandResult = commandObject.executeCommand(workspaceUI,command);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                commandResult = {};
                commandResult.cmdDone = false;
                commandResult.alertMsg = "Unknown error executing command: " + error.message;
                commandResult.isFatal = true;
                
            }
        }
        else {
            commandResult = {};
            commandResult.cmdDone = false;
            commandResult.alertMsg = "Command type not found: " + command.type;
        }
        
        //history??
        
        //fire events!!
        
        //display? Including for fatal errors?
        
        if(commandResult.alertMsg) apogeeapp.app.CommandManager.errorAlert(commandResult.alertMsg,commandResult.isFatal);
        
        return commandResult;
    }
    
    /** This message does a standard error alert for the user. If the error is
     * fatal, meaning the application is not in a stable state, the flag isFatal
     * should be set to true. Otherwise it can be omitted or set to false.  */
    static errorAlert(errorMsg,isFatal) {
        if(isFatal) {
            errorMsg = "Fatal Error: The application is in an indterminate state and should be closed!. " + errorMsg;
        }
        
        alert(errorMsg);
    }
    
    /** This registers a command. The command object should hold two functions,
     * executeCommand(workspaceUI,commandData) and, if applicable, createUndoCommand(workspaceUI,commandData)
     * and it should have the constant COMMAND_TYPE.
     */
    static registerCommand(commandObject) {
        
        //repeat warning
        let existingCommandObject = apogeeapp.app.CommandManager.commandMap[commandObject.COMMAND_TYPE];
        if(existingCommandObject) {
            alert("The given command already exists in the command manager: " + commandObject.COMMAND_TYPE + ". It will be replaced with the new command");
        }
        
        apogeeapp.app.CommandManager.commandMap[commandObject.COMMAND_TYPE] = commandObject;
    }
    
    static getCommandObject(commandType) {
        return apogeeapp.app.CommandManager.commandMap[commandType];
    }
    
}

/** This is a map of commands accessibly to the command manager. */
apogeeapp.app.CommandManager.commandMap = {};



