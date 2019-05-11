/* 
 * This class manages executing commands and storign and operating the command history for undo/redo.
 * 
 * Command Structure:
 * {
 *      cmd - This is a function that executes the command. It should return a 
 *      ActionResponse, and take as optional input an action response to use.
 *     
 *      cmdList - for a compound command, instead of cmd there is a list of cmd functions.
 *     
 *      undoCmd - This is a cmd that will undo the given cmd. It should have the
 *      same structure. If this is left undefined (or any false value) then the command
 *      will not allow undo
 *     
 *      undoCmdList - This is used instead fo undoCmd if there are multiple 
 *      commands to undo.
 *      
 *      desc - This is an option description of what the command does.
 *      
 *      [other items, such as "view" are tbd]
 * }
 * 
 * NOTE - THERE ARE A FEW TODOS HERE.
 */
apogee.app.CommandManager = class {
    constructor() {
        this.clearHistory();
    }
    
    /** This method executes the given command and, if applicable, adds it to the queue. */
    executeCommand(command) {
        let success;
        
        if(command.cmd) {
            success = this.executeCommandFunction(command.cmd);
        }
        else if(command.cmdList) {
            success = this.executeCommandFunctionList(command.cmdList);
        }
        else {
            //this shouldn't happen
            alert("Improper command: no action defined.");
            return;
        }
        
        //handle success or failue
        if(success) {
            if((command.undoCmd)||(command.undoCmdList)) {
                this.history.push(command);
                this.nextUndoIndex++;
            }
        }
        else {
            //no action - don't add to list, and failure handled already.
        }
    }
    
    /** This method clears the undo/redo history. */
    clearHistory() {
        this.nextUndoIndex = -1;
        this.history = [];
    }
    
    /** If there is an undo command, this method will return a description if there
     * is one or an empty string. If there is no undo command, this method will return
     * the value apogee.app.CommandManager.NO_COMMAND. */
    getNextUndoDesc() {
        if((this.nextUndoIndex >= 0)&&(this.nextUndoIndex < this.history.length)) {
            let nextCommandForUndo = this.history[this.nextUndoIndex];
            if(nextCommandForUndo.desc) {
                return nextCommandForUndo.desc
            }
            else {
                return "";
            }
        }
        else {
            return apogee.app.CommandManager.NO_COMMAND;
        }
    }
    
    /** If there is an redo command, this method will return a description if there
     * is one or an empty string. If there is no undo command, this method will return
     * the value apogee.app.CommandManager.NO_COMMAND. */
    getNextRedoDesc() {
        if((this.nextUndoIndex >= -1)&&(this.nextUndoIndex < this.history.length - 1)) {            
            let nextCommandForRedo = this.history[this.nextUndoIndex + 1];
            if(nextCommandForRedo.desc) {
                return nextCommandForRedo.desc
            }
            else {
                return "";
            }
        }
        else {
            return apogee.app.CommandManager.NO_COMMAND;
        }
    }
    
    /** This method undoes the next command to be undone. */
    undo() {
        let nextCommandForUndo;
        if((this.nextUndoIndex >= 0)&&(this.nextUndoIndex < this.history.length)) {
            nextCommandForUndo = this.history[this.nextUndoIndex];
        }
        else {
            //the ui should not let us get here
            alert("There is not command to undo");
        }
        
        //execute undo for this command
        let success;
        if(nextCommandForUndo.undoCmd) {
            let undoFunction = nextCommandForUndo.undoCmd
            success = this.executeCommandFunction(undoFunction);
        }
        else if(nextCommandForUndo.undoCmdList) {
            let undoFunctionList = nextCommandForUndo.undoCmdList
            success = this.executeCommandFunctionList(undoFunctionList);
        }
        else {
            //we shouldn't get here
            alert("Error: There is no command to undo.");
            return;
        }
        
        //update the command history
        if(success) {
            //back up the undo index to the previous command
            this.nextUndoIndex--;
        }
        else {
            //clear this undo command and all those before it. 
            //set next undo to invalid
            this.history = this.history.slice(this.nextUndoIndex + 1);
            this.nextUndoIndex = -1;
            //TODO: Add an alert? Or is that handled below?
        }
        
    }
    
    /** This method redones the next command to be redone. */
    redo() {
        let nextCommandForRedo;
        if((this.nextUndoIndex >= -1)&&(this.nextUndoIndex < this.history.length - 1)) {            
            nextCommandForRedo = this.history[this.nextUndoIndex + 1];
        }
        else {
            //the ui should not let us get here
            alert("There is no command to redo");
        }
        
        //execute redo for this command
        let success;
        if(nextCommandForRedo.cmd) {
            let redoFunction = nextCommandForRedo.cmd
            success = this.executeCommandFunction(redoFunction);
        }
        else if(nextCommandForRedo.cmdList) {
            let redoFunctionList = nextCommandForRedo.redoCmdList
            success = this.executeCommandFunctionList(redoFunctionList);
        }
        else {
            //we shouldn't get here
            alert("Error: There is no command to redo.");
            return;
        }
        
        //update the command history
        if(success) {
            //back up the undo index
            this.nextUndoIndex++;
        }
        else {
            //clear this failed command and all commands after it, keeping the same undo index
            this.history = this.history.slice(0,this.nextUndoIndex + 1);
            //TODO: Add an alert? Or is that handled below?
        }
        
    }
    
    //=================================
    // Private Methods
    //=================================
    
    /** This method executes a cmd function. 
     * @private */
    this.executeCommandFunction(cmdFunction) {
        //TODO: FIGURE OUT WHAT GOES HERE AND HOW TO MANAGE FAILURE
        //should return true or false for success
    }
    
    /** This method executes a list of cmd fucntions.*/
    this.executeCommandFunctionList(cmdFunctionList) {
        //TODO: FIGURE OUT WHAT GOES HERE AND HOW TO MANAGE FAILURE
        //should return true or false for success
        //DO WE EVEN WANT THE COMMAND LIST OPTION?
    }
}

/** This is a token to represent there is no command available, either for 
 * undo or redo. */
apogee.app.CommandManager.NO_COMMAND = {};


