import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"literatePageTransaction",
 *   "memberFullName":(main member full name),
 *   "steps":(steps json)
 * }
 */ 
let literatepagetransaction = {};

//=====================================
// Command Object
//=====================================

literatepagetransaction.createUndoCommand = function(workspaceUI,commandData) {
    
    if(commandData.undoSteps) {
        //temporary implementation
        var undoCommandData = {};
        undoCommandData.type = literatepagetransaction.COMMAND_TYPE;
        undoCommandData.steps = commandData.undoSteps;
        undoCommandData.startSelection = commandData.endSelection;
        undoCommandData.startMarks = commandData.endMarks;
        undoCommandData.endSelection = commandData.startSelection;
        undoCommandData.endMarks = commandData.startMarks;
        undoCommandData.memberFullName = commandData.memberFullName;
        return undoCommandData;
    }
    else {
        return null;
    }
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
literatepagetransaction.executeCommand = function(workspaceUI,commandData) {
    
    var error = false;
    var errorMsg;
    
    var workspace = workspaceUI.getWorkspace();
    //get the member
    var member = workspace.getMemberByFullName(commandData.memberFullName);   
    var component = workspaceUI.getComponent(member);
    
    var editorData = component.getEditorData();
    var editorManager = component.getEditorManager();
            
    var newEditorData = editorManager.getNewEditorData(editorData,commandData);

    if(newEditorData) {
        component.setEditorData(newEditorData);
    }
    else {
        error = true;
        errorMsg = "Unknown error";
    }
    
    var commandResult = {};
    commandResult.cmdDone = !error;
    if(errorMsg) commandResult.alertMsg = errorMsg;
    
    return commandResult;
}

literatepagetransaction.COMMAND_TYPE = "literatePageTransaction";

CommandManager.registerCommand(literatepagetransaction);


