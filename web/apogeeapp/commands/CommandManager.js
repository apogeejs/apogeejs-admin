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
 * - function executeCommand(workspaceManager,commandData,optionalAsynchOnComplete) = This exectues the command and return a commandResult object.
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
 *      errorMsg - This is a message for the user after the command was executed. This
 *      is typically an error mesasge. There may still be a message if cmdDone is true, 
 *      since that does not necessarily imply the command was exectued completely
 *      as intended.
 *      
 *      
 *      
 *      (all other data depends on the specific command)
 * }
 *
 */
export default class CommandManager {
    constructor(app) {
        this.app = app;

        this.commandHistory = new CommandHistory(this,app);
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. 
     * Supress history does not add this command to the history. It is used by the history for
     * undo commands/redo commands.
    */
    executeCommand(command,suppressFromHistory) {
        //get a mutable workspace manager instance
        let oldWorkspaceManager = this.app.getWorkspaceManager();
        let newWorkspaceManager;
        if(oldWorkspaceManager) {
            newWorkspaceManager = oldWorkspaceManager.getMutableWorkspaceManager();
        }

        let commandResult;
        
        var commandObject = CommandManager.getCommandObject(command.type);
        let undoCommand;
        let description;

        if(commandObject) {

            //create undo command before doing command (since it may depend on current state)
            if((!suppressFromHistory)&&(commandObject.createUndoCommand)) {   
                undoCommand = commandObject.createUndoCommand(newWorkspaceManager,command);  
            }

            //read the desrition (this needs to be improved)
            description = commandObject.commandInfo.type;

            try {
                commandResult = commandObject.executeCommand(newWorkspaceManager,command);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                commandResult = {};
                commandResult.cmdDone = false;
                commandResult.errorMsg = "Unknown error executing command: " + error.message;
            }
        }
        else {
            commandResult = {};
            commandResult.cmdDone = false;
            commandResult.errorMsg = "Command type not found: " + command.type;
        }

        //create change list
        let changeResult = this._createChangeResult(commandResult);

        //--------------------------
        // Accept or reject update
        //--------------------------

        //if the command succceeded, update the workspace manager instance
        if(changeResult.cmdDone) {
            //success - commit accept change
            if(newWorkspaceManager) {
                this.app.setWorkspaceManager(newWorkspaceManager);
            }

            //add to history if the command was done and there is an undo command
            if(undoCommand) {   
                this.commandHistory.addToHistory(undoCommand,command,description);
            }

            //fire events!!
            this._publishEvents(changeResult);
        }
        else {
            //failure - keep the old workspace 
            let errorMsg = changeResult.errorMsgs.join("; ");
            alert("Command failed: " + errorMsg);
        }
        
        return changeResult;
    }

    /** This returns the command history. */
    getCommandHistory() {
        return this.commandHistory;
    }

    //=========================================
    // Private Methods
    //=========================================

    /** This method creates a change result, used for firing events and as a return value from the command result, the
     * return value from the command. */
    _createChangeResult(commandResult) {
        //traverse the command result tree, make a change list, store all error msgs, check if there are any failures
        //on failure, ignore changes
        let changeMap = {};
        let errorInfo = {};
        this._processCommandResults(commandResult,changeMap,errorInfo);

        let changeResult = {};
        if(errorInfo.error) {
            changeResult.cmdDone = false;
            changeResult.errorMsgs = errorInfo.errorMsgs;
        }
        else {
            changeResult.cmdDone = true;
            changeResult.changeList = [];
            for(let key in changeMap) {
                let changeMapEntry = changeMap[key];
                let changeEntry = this._changeMapEntryToChangeEntry(changeMapEntry);
                if(changeEntry) changeResult.changeList.push(changeEntry);
            }
        }

        return changeResult;
    }

    /** This method flattens the command result into the change map and the error info. */
    _processCommandResults(commandResult,changeMap,errorInfo) {
        if(!commandResult.cmdDone) {
            errorInfo.error = true;
            if(!errorInfo.errorMsgs) errorInfo.errorMsgs = [];
            errorInfo.errorMsgs.push(commandResult.errorMsg);
        }
        else if((commandResult.target)||(commandResult.targetId)) {
            this._addToChangeMap(commandResult,changeMap);
        }

        //convert the actionChangeList to a commandChangeList
        if(commandResult.actionResult) {
            this._processActionChangeList(commandResult.actionResult,changeMap,errorInfo);
        }

        //process child command results
        if(commandResult.childCommandResults) {
            commandResult.childCommandResults.forEach(childCommandResult => this._processCommandResults(childCommandResult,changeMap,errorInfo));
        }
    }

    /** This method takes then entries from the action change list and enters them inot the command change map.
     * It does this by finding the associated Component/ModelManager change and adding an entry to the change map for it. */
    _processActionChangeList(actionChangeResult,changeMap,errorInfo) {
        if(!actionChangeResult.actionDone) {
            errorInfo.error = true;
            if(actionChangeResult.errorMsgs) {
                if(!errorInfo.errorMsgs) errorInfo.errorMsgs = [];
                errorInfo.errorMsgs.push(...actionChangeResult.errorMsgs);
            }
        }
        else if(actionChangeResult.changeList) {
            actionChangeResult.changeList.forEach(actionChangeEntry => {
                //create a command change entry for each action change entry and then add it to the change map
                let cmdRsltEquivelent = {};
                if(actionChangeEntry.event) {

                    let workspaceManager = this.app.getWorkspaceManager();
                    if(!workspaceManager) {
                        //we should have a workspace manager if we get here.
                        throw new Error("Unknown error - workspace manager missing!");
                    }
                    let modelManager = workspaceManager.getModelManager();

                    //create the cmdResult for this action result
                    cmdRsltEquivelent.eventAction = actionChangeEntry.event;

                    if(actionChangeEntry.member) {
                        let componentId = modelManager.getComponentIdByMemberId(actionChangeEntry.member.getId());
                        switch(actionChangeEntry.event) {
                            case "created":
                            case "updated":
                                cmdRsltEquivelent.target = modelManager.getComponentByComponentId(componentId);
                                break;

                            case "deleted":
                                cmdRsltEquivelent.targetId = componentId;

                                //handle the case of no component for this member id, which should happen for non-main members
                                //in a component. Just don't add a map entry.
                                if(!cmdRsltEquivelent.targetId) return;

                                cmdRsltEquivelent.targetType = "component";
                                break;
                            
                            default: 
                                throw new Error("unrecognized event: " + actionChangeEntry.event);
                        }
                    }
                    else {
                        switch(actionChangeEntry.event) {
                            case "created":
                            case "updated":
                                cmdRsltEquivelent.target = modelManager;
                                break;

                            case "deleted":
                                cmdRsltEquivelent.targetId = modelManager.getId();
                                cmdRsltEquivelent.targetType = modelManager.getType();
                                break;

                            default: 
                                throw new Error("unrecognized event: " + actionChangeEntry.event);
                        }

                    }

                    this._addToChangeMap(cmdRsltEquivelent,changeMap);
                }
            });
        }
    }

    /** This method merges a change entry into the change map. */
    _addToChangeMap(commandResultEntry,changeMap) {
        let targetId;
        let target;
        if(commandResultEntry.target) {
            target = commandResultEntry.target;
            targetId = target.getId();
        }
        else if((commandResultEntry.targetId != undefined)&&(commandResultEntry.targetType)) {
            target = undefined;
            targetId = commandResultEntry.targetId;
        }
        else {
            //not a valid entry
            //I should acknowledge an error here
            return;
        }
        
        //create the change map entry
        let changeMapEntry = changeMap[targetId];
        if(!changeMapEntry) {
            changeMapEntry = {};
            if(commandResultEntry.target) {
                changeMapEntry.target = target;
            }
            changeMapEntry.targetId = targetId;
            changeMapEntry.eventName = this._createEventName(commandResultEntry.eventAction,target.getType());
            changeMap[targetId] = changeMapEntry;
        }
        //there may be a case where we do not have a target instance in the change map entry because
        //we found a delete first. We could add the target if we later come across a create or update, but
        //we won't need it since the event will be either delete or a null event.

        //store the event type for this target
        changeMapEntry[commandResultEntry.eventAction] = true;
    }

    /** This converts the change map entry, which usd as a working variable to combine events so there
     * is only one per target, into a change enry, which is used for firing events. */
    _changeMapEntryToChangeEntry(changeMapEntry) {
        let changeEntry = {};

        if((changeMapEntry.created)&&(changeMapEntry.deleted)) {
            //no event - the object was created and destroyed
            changeEntry = null;
        }
        else if(changeMapEntry.created) {
            //created event
            changeEntry.eventName = changeMapEntry.eventName;
            changeEntry.target = changeMapEntry.target;
        }
        else if(changeMapEntry.deleted) {
            //deleted event
            changeEntry.eventName = changeMapEntry.eventName;
            changeEntry.targetId = changeMapEntry.targetId;
            changeEntry.targetType = changeMapEntry.targetType;
        }
        else if(changeMapEntry.updated) {
            changeEntry.eventName = changeMapEntry.eventName;
            changeEntry.target = changeMapEntry.target;
        }
        else {
            //unknown case
            changeEntry = null;
        }
        return changeEntry;
    }

    _lookupComponentIdFromMemberId(memberId) {
        throw new Error("Implement this!");
    }

    /** This is the standardized event name from the event action + the target type. */
    _createEventName(eventAction,targetType) {
        return targetType + "_" + eventAction;
    }

    /** This fires all the necessary events for the given command result */
    _publishEvents(changeResult) {
        if(changeResult.cmdDone) {
            //success - fire all events
            if(changeResult.changeList) {
                changeResult.changeList.forEach( changeEntry => {
                    //fire event
                    if(changeEntry.eventName) {
                        this.app.dispatchEvent(changeEntry.eventName,changeEntry);
                    } 
                })
            }
        }
        else {
            //failure - show error message
            let errorMsg;
            if(changeResult.errorMsgs) {
                errorMsg = changeResult.errorMsgs.join("\n");
            }
            else {
                errorMsg = "There was an unknown error executing the command";
            }
            CommandManager.errorAlert(errorMsg);
        }
    }

    //=========================================
    // Static Methods
    //=========================================
    
    /** This message does a standard error alert for the user. If the error is
     * fatal, meaning the application is not in a stable state, the flag isFatal
     * should be set to true. Otherwise it can be omitted or set to false.  */
    static errorAlert(errorMsg) {
        alert(errorMsg);
    }
    
    /** This registers a command. The command object should hold two functions,
     * executeCommand(workspaceManager,commandData,optionalAsynchOnComplete) and, if applicable, createUndoCommand(workspaceManager,commandData)
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



