/* 
 * This class manages the command history for undo/redo.
 * 
 * Commands that can be undone are stored in a circular queue with a length that is optionally 
 * settable at startup. (Otherwise a default len this used.)
 * 
 * Some rules for the undo/redo queue:
 * - only a max number of commands are stored
 * - when a command is undone or redone, the next undo and redo position is updated
 * - new commands are inserted replacing the next redo command (if there is one, otherwise they areput at the end)
 * - once the max number of commands are reached, additional added commands replace he oldeest command in the queue
 * 
 * The command manager fires an event each time the command history is updated.
 */
apogeeapp.app.CommandHistory = class {
    constructor(commandManger, eventManager, optionalUndoCommandCount) {
        this.commandManager = commandManager;
        this.eventManager = eventManager;
        this.undoCommandCount = (optionalUndoCommandCount !== undefined) ? optionalUndoCommandCount : apogeeapp.app.CommandHistory.DEFAULT_UNDO_COMMAND_COUNT;
        this.clearHistory();
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. */
    addToHistory(undoCommand,redoCommand,description) {
        
        if((!undoCommand)||(!redoCommand)) {
            alert("Both the undo command and redo command must be provided");
            return;
        }
        
        var command = {};
        command.redoCmd = redoCommand;
        command.undoCmd = undoCommand;
        command.desc = description;
        
        this._saveCommand(command);
    }
    
    /** This method clears the undo/redo history. */
    clearHistory() {
        //set a fixed size array for our circular queue
        this.undoQueue = new Array(this.undoCommandCount);
        
        //we will keep cmd index values that DO NOT wrap.
        //we will assume we do not overflow the integers for now
        //to get an array index, we convert from cmd index to array index with a function using modulo
        
        //this where we will put the next added command
        this.nextInsertCmdIndex = 0;
        //this is last index that has a valid command, but only if it is greater than or equal to our first cmd index
        this.lastUsedCmdIndex = -1;
        //this is the first command index that has a valid command, but only if it is less than or equal to the last command index.
        this.firstUsedCmdIndex = 0;
        
        if(this.eventManager) {
            this.eventManager.dispatchEvent("historyUpdate",this);
        }
        
    }
    
    /** If there is an undo command, this method will return the description if there
     * is one or an empty string. If there is no undo command, this method will return
     * the value apogeeapp.CommandHistory.NO_COMMAND. */
    getNextUndoDesc() {
        let command = this._getNextUndoCommand(false);
        if(command) {
            if(command.desc) {
                return command.desc
            }
            else {
                return "";
            }
        }
        else {
            return apogeeapp.app.CommandHistory.NO_COMMAND;
        }
    }
    
    /** If there is an redo command, this method will return the description if there
     * is one or an empty string. If there is no undo command, this method will return
     * the value apogeeapp.CommandHistory.NO_COMMAND. To test equality with
     * apogeeapp.CommandHistory.NO_COMMAND, use == or ===. Do not test equality
     * with json equals!*/
    getNextRedoDesc() {
        let command = this._getNextRedoCommand(false);
        if(command) {
            if(command.desc) {
                return command.desc
            }
            else {
                return "";
            }
        }
        else {
            return apogeeapp.app.CommandHistory.NO_COMMAND;
        }
    }
    
    /** This method undoes the next command to be undone. */
    undo() {
        let command = this._getNextUndoCommand(true);
        if((command)&&(command.undoCmd)) {
            let commandResult = this.commandManager.executeCommand(command.undoCmd);
            if(!commandResult.cmdDone) {
                this._commandUndoneFailed();
            }
        }
        else {
            //the ui should not let us get here
            alert("There is not command to undo");
        }  
    }
    
    /** This method redones the next command to be redone. */
    redo() {
        let command = this._getNextRedoCommand(true);
        if((command)&&(command.cmd)) {
            let commandResult = this.commandManager.executeCommand(command.redoCmd);
            if(!commandResult.cmdDone) {
                this.commandRedoneFailed();
            }
        }
        else {
            //the ui should not let us get here
            alert("There is not command to redo");
        }  
    }
    
    //=================================
    // Private Methods
    //=================================

    //-------------------------
    // These functions manage the undo queue
    //-------------------------
    
    _saveCommand(command) {
        let oldNextCmdIndex = this.nextInsertCmdIndex;
        let oldLastCmdIndex = this.lastUsedCmdIndex;
        let oldFirstCmdIndex = this.firstUsedCmdIndex;
        
        let insertArrayIndex = this._getArrayIndex(this.nextInsertCmdIndex);
        this.undoQueue[insertArrayIndex] = command;
        
        //update cmd index vlues
        // -last used index is the one just added
        this.lastUsedCmdIndex = this.nextInsertCmdIndex;
        // -next insert index is one more than the previous (wrapping is NOT done in the cmd index values, only in the array index values)
        this.nextInsertCmdIndex++;
        
        // -set the first used index
        if(oldFirstCmdIndex > oldLastCmdIndex) {
            //we need to set a valid value
            this.firstUsedCmdIndex == oldNextCmdIndex;
        }
        else {
            //check for wrapping commands
            let oldFirstArrayIndex = this._getArrayIndex(oldFirstCmdIndex);
            if(insertArrayIndex == oldFirstArrayIndex) {
                this.firstUsedCmdIndex++;
            }
        }
        
        //clear out any now unreachable redo commands
        if(this.nextInsertCmdIndex <= oldLastCmdIndex) {
            this._clearCommands(this.nextInsertCmdIndex,oldLastCmdIndex);
        }    
    }
    
    _getNextUndoCommand(doQueuePositionUpdate) {
        if((this.nextInsertCmdIndex - 1 >= this.firstUsedCmdIndex)&&(this.nextInsertCmdIndex - 1 <= this.lastUsedCmdIndex)) {
            let undoArrayIndex = this._getArrayIndex(this.nextInsertCmdIndex - 1);
            
            //update the queue positions, if requested
            if(doQueuePositionUpdate) {
                this.nextInsertCmdIndex--;
                
                //notify of change to command history
                if(this.eventManager) {
                    this.eventManager.dispatchEvent("historyUpdate",this);
                }
                
            }
            
            return this.undoQueue[undoArrayIndex];
        }
        else {
            //no available command
            return null;
        }
    }
    
    _getNextRedoCommand(doQueuePositionUpdate) {
        if((this.nextInsertCmdIndex >= this.firstUsedCmdIndex)&&(this.nextInsertCmdIndex <= this.lastUsedCmdIndex)) {
            let redoArrayIndex = this._getArrayIndex(this.nextInsertCmdIndex);
            
            //update the queue positions, if requested
            if(doQueuePositionUpdate) {
                this.nextInsertCmdIndex++;
                
                //notify of change to command history
                if(this.eventManager) {
                    this.eventManager.dispatchEvent("historyUpdate",this);
                }
            }
            
            return this.undoQueue[redoArrayIndex];
        }
        else {
            return null;
        }
    }
    
    _commandUndoneFailed() {
        //clear the undone command so it can not be redone (at the current position this.nextInsertCmdIndex)
        //and clear all commands previous to this one
        this._clearCommands(this.firstUsedCmdIndex,this.nextInsertCmdIndex);
        this.firstUsedCmdIndex = this.nextInsertCmdIndex;
        //we also need to update the last used index if it was the cmd we just failed to undo
        if(this.lastUsedCmdIndex === this.nextInsertCmdIndex) {
            this.lastUsedCmdIndex--;
        }
        
        //notify of change to command history
        if(this.eventManager) {
            this.eventManager.dispatchEvent("historyUpdate",this);
        }
    }
    
    _commandRedoneFailed() {
        //clear the redone command so it can not be undone (at the current position this.nextInsertCmdIndex-1)
        //and clear all commands after to this one
        this._clearCommands(this.nextInsertCmdIndex-1,this.lastUsedCmdIndex);
        this.lastUsedCmdIndex = this.nextInsertCmdIndex-1;
        //we also need to update the first used index if it was the cmd we just failed to redo
        if(this.firstUsedCmdIndex === this.nextInsertCmdIndex-1) {
            this.firstUsedCmdIndex++;
        }
        
        //notify of change to command history
        if(this.eventManager) {
            this.eventManager.dispatchEvent("historyUpdate",this);
        }
    }
    
    _getArrayIndex(cmdIndex) {
        return cmdIndex % this.undoCommandCount;
    }
    
    _clearCommands(startCmdIndex,endCmdIndex) {
        for(var cmdIndex = startCmdIndex; cmdIndex <= endCmdIndex; cmdIndex++) {
            let arrayIndex = this._getArrayIndex(cmdIndex);
            this.undoQueue[arrayIndex] = undefined;
        }
    }
}

/** This is a token to represent there is no command available, either for 
 * undo or redo. */
apogeeapp.app.CommandHistory.NO_COMMAND = {};

/** This is the default number of stored undo/redo commands */
apogeeapp.app.CommandHistory.DEFAULT_UNDO_COMMAND_COUNT = 50;


