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
 * - object commandInfo - This is metadata for the command:
 *      - type - A string giving the name of the command type
 *      - targetType - This identifies the type of the command target (what the command acts on) This may be missing if there is no event.
 *      - event - This is the name of the event the command will fire. (It should be "created", "updated", "deleted" or missing if there is no event) 
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
    executeCommand(command,suppressFromHistory) {
        var workspaceUI = this.app.getWorkspaceUI();
        let commandResult;
        
        var commandObject = CommandManager.getCommandObject(command.type);
        let asynchOnComplete;
        let undoCommand;
        let description;

        if(commandObject) {

            //for asynch transactions, pass a callback for handling any asynch result
            if(commandObject.commandInfo.isAsynch) {
                asynchOnComplete = commandResult => this._publishEvents(commandResult);
            }

            //create undo command before doing command (since it may depend on current state)
            if((!suppressFromHistory)&&(commandObject.createUndoCommand)) {   
                undoCommand = commandObject.createUndoCommand(workspaceUI,command);  
            }

            //read the desrition (this needs to be improved)
            description = commandObject.commandInfo.type;

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
        
        //add to history if the command was done and there is an undo command
        if((commandResult.cmdDone)&&(undoCommand)) {   
            this.commandHistory.addToHistory(undoCommand,command,description);
        }
        
        //fire events!!
        this._publishEvents(commandResult);
        
/////////////////////////////////////////////////////
//REMOVE THIS WHEN I HAVE BETTER HANDLING IN THE UI???
        if(commandResult.alertMsg) CommandManager.errorAlert(commandResult.alertMsg,commandResult.isFatal);
//////////////////////////////////////////////////////

        return commandResult;
    }

    /** This returns the command history. */
    getCommandHistory() {
        return this.commandHistory;
    }

    //=========================================
    // Private Methods
    //=========================================

    /** This fires all the necessary events for the given command result */
    _publishEvents(commandResult) {
        //combine the command result of successful events so here is one per target
        //also fire all the unsuccesful events
        let successEventMap = {};
        let failedEvents = [];
        this._flattenCommandResults(commandResult,successEventMap,failedEvents);

        //fire success events (we merged these for one per target)
        for(let key in successEventMap) {
            this._fireEvent(successEventMap[key]);
        }

        //fire failed events
        failedEvents.forEach(eventData => this._fireEvent(eventData));
    }

    _fireEvent(eventData) {
        if((eventData.action == "created")||(eventData.action == "deleted")) {
            //dispatch created and deleted events to the parent
            if(eventData.parent) eventData.parent.dispatchEvent(eventData.action,eventData);
        }
        if((eventData.action == "updated")||(eventData.action == "deleted")) {
            //dispatch updated and deleted events to the target
            if(eventData.target) eventData.target.dispatchEvent(eventData.action,eventData);
        } 
    }

    /** This flattens the command result structure, which contains a single parent and potentially mulitple
     * generations of child events.
     */
    _flattenCommandResults(commandResult,successEventMap,failedEvents) {
        if(commandResult.cmdDone) {

            let targetId = commandResult.target ? commandResult.target.getEventId() : null;

            if(targetId) {
                //marge target info so there is no more than one event per target (for successful events)
                let eventData = successEventMap[targetId];
                if(eventData) {
                    eventData = this._mergeEventData(targetData,commandResult);
                }
                else {
                    eventData = this._createNewEventData(commandResult);
                }
                successEventMap[targetId] = eventData;
            }

            //process any children
            if(commandResult.childCommandResults) {
                commandResult.childCommandResults.forEach(childCommandResult => this._flattenCommandResults(childCommandResult,successEventMap,failedEvents));
            }
        }
        else {
            //if we didn't process this, add it to other events
            failedEvents.push(this._createNewEventData(commandResult));
        }
    }

    /** This creates new event target data from a command result */
    _createNewEventData(commandResult) {
        //copy everything but the childCommandResults
        let eventData = {};
        for(let key in commandResult) {
            if(key == "childCommandResults") continue;
            eventData[key] = commandResult[key];
        }
        if(commandResult.target) eventData.fieldsUpdated = commandResult.target.getUpdated();
        return eventData;
    }

    /** Thie updated the target data for the new command result. */
    _mergeEventData(eventData,commandResult) {

        let action = this._getActionType(eventData.action,commandResult.action);

        //we have a potential new action
        eventData.action = action;
        //we might have to combine error messages
        eventData.errorMsg = this._getMergeErrorMsg(targetData.alertMsg,commandResult.alertMsg);
        //or the is pending flags
        eventData.isPending = eventData.isPending || commandResult.isPending;

        //parent would only be present on the first command
        //child commands and are not in the event target data
         
        return eventData;
    }

    _getMergeErrorMsg(firstMsg,secondMsg) {
        if(firstMsg && secondMsg) {
            //we should get a better concatenation...
            return firstMsg + "; " + secondMsg;
        }
        else if(firstMsg) {
            return firstMsg;
        }
        else if(secondMsg) {
            return secondMsg;
        }
        else {
            return undefined;
        } 
    }

    /** This creates a combined event by merging two successive events within the same command. */
    _getActionType(firstAction,secondAction) {
        if(firstAction == "created") {
            if(secondAction == "updated") {
                //created + updated = created
                return "created";
            }
            else if(secondAction == "deleted"){
                //created + deleted = canceling event
                //we can support this, but for now we will make it an error
                return "error";
            }
        }
        else if(fistAction == "updated") {
            if(secondAction == "updated") {
                return "updated";
            }
            else if(secondAction == "deleted") {
                //updated + deleted = deleted
                return "deleted";
            }
        }

        //any other scenario is an error
        return "error";
    }

    //=========================================
    // Static Methods
    //=========================================
    
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
     * and it should have the metadata commandInfo.
     */
    static registerCommand(commandObject) {
        
        //repeat warning
        let existingCommandObject = CommandManager.commandMap[commandObject.commandInfo.type];
        if(existingCommandObject) {
            alert("The given command already exists in the command manager: " + commandObject.commandInfo.type + ". It will be replaced with the new command");
        }
        
        CommandManager.commandMap[commandObject.commandInfo.type] = commandObject;
    }
    
    static getCommandObject(commandType) {
        return CommandManager.commandMap[commandType];
    }
    
}

/** This is a map of commands accessibly to the command manager. */
CommandManager.commandMap = {};



