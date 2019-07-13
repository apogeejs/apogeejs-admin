/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"literatePageTransaction",
 *   "memberFullName":(main member full name),
 *   "steps":(steps json)
 * }
 */ 
apogeeapp.app.literatepagetransaction = {};

//=====================================
// Command Object
//=====================================

apogeeapp.app.literatepagetransaction.createUndoCommand = function(workspaceUI,commandData) {
    
    if(commandData.undoSteps) {
        //temporary implementation
        var undoCommandData = {};
        undoCommandData.type = apogeeapp.app.literatepagetransaction.COMMAND_TYPE;
        undoCommandData.steps = commandData.undoSteps;
        return undoCommandData;
    }
    else {
        return null;
    }
}

/** This method is used for updating property values from the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to edit the values of those properties too. */
apogeeapp.app.literatepagetransaction.executeCommand = function(workspaceUI,commandData) {
    
    var error = false;;
    var errorMsg;
    
    var workspace = workspaceUI.getWorkspace();
    //get the member
    var member = workspace.getMemberByFullName(commandData.memberFullName);   
    var component = workspaceUI.getComponent(member);
    
    var editorData = component.getEditorData();
            
    var newEditorData = proseMirror.getNewEditorData(editorData,commandData.steps);

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

apogeeapp.app.literatepagetransaction.COMMAND_TYPE = "literatePageTransaction";

apogeeapp.app.CommandManager.registerCommand(apogeeapp.app.literatepagetransaction);


