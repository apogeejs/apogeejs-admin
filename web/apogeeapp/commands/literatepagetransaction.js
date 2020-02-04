import CommandManager from "/apogeeapp/commands/CommandManager.js";

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

literatepagetransaction.createUndoCommand = function(workspaceManager,commandData) {
    
    if(commandData.undoSteps) {
        //temporary implementation
        var undoCommandData = {};
        undoCommandData.type = literatepagetransaction.commandInfo.type;
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
literatepagetransaction.executeCommand = function(workspaceManager,commandData) {
    
    var error = false;
    var errorMsg;
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    //get the member
    var member = model.getMemberByFullName(commandData.memberFullName);   
    var component = modelManager.getComponent(member);
    
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

    if(commandResult.actionDone) {
        commandResult.target = modelManager.getComponent(member);
        commandResult.action = "updated";
    }
    
    return commandResult;
}

literatepagetransaction.commandInfo = {
    "type": "literatePageTransaction",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(literatepagetransaction);


