import CommandHistory from "./CommandHistory.js";

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
 * - function executeCommand(workspaceUI,commandData,optionalAsynchOnComplete) = This exectues the command and return a commandResult object.
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
export default class CommandManager {
    constructor(app,eventManager) {
        this.app = app;
        this.eventManager = eventManager;

        this.commandHistory = new CommandHistory(this,eventManager);
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. 
     * Supress history does not add this command to the history. It is used by the history for
     * undo commands/redo commands.
    */
    executeCommand(command,asynchOnComplete,suppressFromHistory) {
        var workspaceUI = this.app.getWorkspaceUI();
        let commandResult;
        
        var commandObject = CommandManager.getCommandObject(command.type);

        //FOR NOW? - MAKE UNDO COMMAND BEFORE EXECUTING COMMAND, IF WE NEED IT (because it is sometimes made by reading the current state)
        let undoCommand;
        let description;
        if((!suppressFromHistory)&&(commandObject.createUndoCommand)) {   
            undoCommand = commandObject.createUndoCommand(workspaceUI,command);  
            description = commandObject.COMMAND_TYPE; //need a better description
        }

        if(commandObject) {
            try {
                commandResult = commandObject.executeCommand(workspaceUI,command,asynchOnComplete);
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
        //this is temporary code
        if((commandResult.cmdDone)&&(undoCommand)) {   
            this.commandHistory.addToHistory(undoCommand,command,description);
        }
        
        //fire events!!
        
        //display? Including for fatal errors?
        
        if(commandResult.alertMsg) CommandManager.errorAlert(commandResult.alertMsg,commandResult.isFatal);
        
        return commandResult;
    }

    /** This returns the command history. */
    getCommandHistory() {
        return this.commandHistory;
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
     * executeCommand(workspaceUI,commandData,optionalAsynchOnComplete) and, if applicable, createUndoCommand(workspaceUI,commandData)
     * and it should have the constant COMMAND_TYPE.
     */
    static registerCommand(commandObject) {
        
        //repeat warning
        let existingCommandObject = CommandManager.commandMap[commandObject.COMMAND_TYPE];
        if(existingCommandObject) {
            alert("The given command already exists in the command manager: " + commandObject.COMMAND_TYPE + ". It will be replaced with the new command");
        }
        
        CommandManager.commandMap[commandObject.COMMAND_TYPE] = commandObject;
    }
    
    static getCommandObject(commandType) {
        return CommandManager.commandMap[commandType];
    }
    
}

/** This is a map of commands accessibly to the command manager. */
CommandManager.commandMap = {};



