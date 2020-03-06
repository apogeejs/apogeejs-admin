import CommandManager from "/apogeeapp/commands/CommandManager.js";
import { Transform, Step } from "/prosemirror/lib/prosemirror-transform/src/index.js";

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


literatepagetransaction.executeCommand = function(workspaceManager,commandData) {
    
    var error = false;
    var errorMsg;
    
    let modelManager = workspaceManager.getModelManager();
    var model = modelManager.getModel();
    //get the member
    var member = model.getMemberByFullName(commandData.memberFullName);   
    var component = modelManager.getComponent(member);

    var oldDocument = component.getDocument();
    var schema = component.getSchema();
            
    var newDocument = updateDocument(oldDocument,schema,commandData);

    if(newDocument) {
        //create the editor state info if we have it
        let editorStateInfo
        if((commandData.endSelection)||(commandData.endMarks)) {
            editorStateInfo = {};
            editorStateInfo.selection = commandData.endSelection;
            editorStateInfo.storedMarks = commandData.endMarks;
        }

        //set the document. Also set some editor state that accompanies the document.
        //this editor state inof should only be stored temporarily, and not be maintained in the component.
        component.setDocument(newDocument,editorStateInfo);
    }
    else {
        error = true;
        errorMsg = "Unknown error";
    }
    
    var commandResult = {};
    commandResult.cmdDone = !error;
    if(error) {
        if(errorMsg) commandResult.errorMsg = errorMsg;
    }
    else {
        commandResult.target = component;
        commandResult.action = "updated";
        commandResult.dispatcher = modelManager;
    }

    return commandResult;
}

function updateDocument(initialDocument, schema, commandData) {

    //apply the editor transaction
    var transform = new Transform(initialDocument);

    //apply the steps
    commandData.steps.forEach(stepJson => {
      try {
        var step = Step.fromJSON(schema, stepJson);
        transform = transform.step(step);
      }
      catch (error) {
        console.log("Step failed: " + JSON.stringify(stepJson));
        return null;
      }
    });

    return transform.doc;
  }

literatepagetransaction.commandInfo = {
    "type": "literatePageTransaction",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(literatepagetransaction);


