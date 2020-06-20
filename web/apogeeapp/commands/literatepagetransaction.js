import CommandManager from "/apogeeapp/commands/CommandManager.js";
import { Transform, Step } from "/prosemirror/dist/prosemirror-transform.es.js";

/** Update Component Command
 *
 * Command JSON format:
 * {
 *   "type":"literatePageTransaction",
 *   "componentId":(component id),
 * 
 *   ============================
 *   == with initial commands 
 *   =============================
 *   "transaction":(the transaction - this is only passed on initial commands. Redo and undo commands do not have it and
 *          must reconstruct the transaction from the steps json),
  *  "initialSelection":(selection before command - only needed for commands that have undo/redo),
 *   "initialMarks":(marks before command - only needed for commands that have undo/redo),
 * 
 *   ============================
 *   == with redo/undo commands NOTE: we modify the command object to remove transaction and other initial data.
 *   == This is because of an impedence mismatch between apogee and prosemirror command structures.
 *   ============================
 *   "steps":(steps json - needed if transaction not present),
 *   "selection": (selection json - needed if transaction no present)
 *   "marks": (marks json - needed if transaction not present)
 * }
 */ 
let literatepagetransaction = {};

//=====================================
// Command Object
//=====================================

literatepagetransaction.createUndoCommand = function(workspaceManager,commandData) {

    //no undo/redo if the document is not changed. This is just an editor state change
    if(!commandData.transaction.docChanged) return null;

    //if we do want to add to history we want to 

    //WE NEED TO GO BACK AND PUT THIS IN!!!
    else return null;



    // var stepsJson = [];
    // var inverseStepsJson = [];

    // for(var i = 0; i < transaction.steps.length; i++) {
    //     var step = transaction.steps[i];
    //     stepsJson.push(step.toJSON());
    //     var stepDoc = transaction.docs[i];
    //     var inverseStep = step.invert(stepDoc);
    //     //this is in the wrong order - we will reverse it below
    //     inverseStepsJson.push(inverseStep.toJSON()); 
    // }

    // //fix the order of inverse commands
    // inverseStepsJson.reverse();
    // commandData.steps = stepsJson;
    // commandData.undoSteps = inverseStepsJson;

    // if(optionalInitialSelection) commandData.startSelection = optionalInitialSelection.toJSON();
    // if(optionalInitialMarks) commandData.startMarks = optionalInitialMarks.map(mark => mark.toJSON());;

    // if(transaction.selection) commandData.endSelection = transaction.selection.toJSON();
    // if(transaction.marks) commandData.endMarks = transaction.marks.map(mark => mark.toJSON());

    

    //     //temporary implementation
    //     var undoCommandData = {};
    //     undoCommandData.type = literatepagetransaction.commandInfo.type;
    //     undoCommandData.steps = commandData.undoSteps;
    //     undoCommandData.startSelection = commandData.endSelection;
    //     undoCommandData.startMarks = commandData.endMarks;
    //     undoCommandData.endSelection = commandData.startSelection;
    //     undoCommandData.endMarks = commandData.startMarks;
    //     undoCommandData.memberId = commandData.memberId;
    //     return undoCommandData;

}


literatepagetransaction.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let component = modelManager.getMutableComponentByComponentId(commandData.componentId);

    let oldEditorState = component.getEditorState();

    let newEditorState = oldEditorState.apply(commandData.transaction);
    component.setEditorState(newEditorState);
}

literatepagetransaction.commandInfo = {
    "type": "literatePageTransaction",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(literatepagetransaction);


