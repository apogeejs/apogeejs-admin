import CommandManager from "/apogeeapp/commands/CommandManager.js";
import { Step } from "/prosemirror/dist/prosemirror-transform.es.js";
import { TextSelection, NodeSelection }  from "/prosemirror/dist/prosemirror-state.es.js";
import { GapCursor } from "/prosemirror/dist/prosemirror-gapcursor.es.js";

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

    let transaction = commandData.transaction;
    if(!transaction) return null;

    //no undo/redo if the document is not changed. This is just an editor state change
    if(!transaction.docChanged) return null;

    //if we do want to add to history we want to store the transaction as data, not objects
    //we will _modify_ the command passed in below, partially due to a slight mismatch between
    //prosemirror and apogee
    let stepsJson = [];
    let inverseStepsJson = [];
    for(let i = 0; i < transaction.steps.length; i++) {
        let step = transaction.steps[i];
        stepsJson.push(step.toJSON());
        let stepDoc = transaction.docs[i];
        let inverseStep = step.invert(stepDoc);
        //this is in the wrong order - we will reverse it below
        inverseStepsJson.push(inverseStep.toJSON()); 
    }

    //fix the order of inverse commands
    inverseStepsJson.reverse();

    //modify the command to save the raw data for he transaction
    commandData.steps = stepsJson;
    if(transaction.selection) commandData.selection = transaction.selection.toJSON();
    if(transaction.marks) commandData.marks = transaction.marks.map(mark => mark.toJSON());

    //create the undo commans
    let undoCommandData = {};
    undoCommandData.type = literatepagetransaction.commandInfo.type;
    undoCommandData.componentId = commandData.componentId;
    undoCommandData.steps = inverseStepsJson;
    if(commandData.initialSelection) undoCommandData.selection = commandData.initialSelection;
    if(commandData.initialMarks) undoCommandData.marks = commandData.initialMarks;

    return undoCommandData;

}


literatepagetransaction.executeCommand = function(workspaceManager,commandData) {
    let modelManager = workspaceManager.getMutableModelManager();
    let component = modelManager.getMutableComponentByComponentId(commandData.componentId);

    let oldEditorState = component.getEditorState();

    let transaction = commandData.transaction;
    //we do not want to store the transaction in history. See note above in create undo command.
    delete commandData.transaction;

    //if the transaction is not serialized, serilized it
    if(!transaction) {
        if(!commandData.steps) {
            console.log("Document transaction with no steps!");
            return;
        }
        let schema = oldEditorState.schema;

        transaction = oldEditorState.tr;
        commandData.steps.forEach( stepJSON => {
            transaction.step(Step.fromJSON(schema,stepJSON));
        })

        if(commandData.selection) {
            let selection = deserializeSelection(transaction.doc,commandData.selection);
            if(selection) transaction.setSelection(selection);
        }

        if(commandData.marks) {
            transaction.setStoredMarks(commandData.marks.map(markJson => Mark.fromJSON(schema,markJson)));
        }
    }

    let newEditorState = oldEditorState.apply(transaction);
    component.setEditorState(newEditorState);    
}

function deserializeSelection(doc,selectionJson) {
    if(selectionJson.type == "text") {
        return TextSelection.fromJSON(doc,selectionJson);
    }
    else if(selectionJson.type == "node") {
        return NodeSelection.fromJSON(doc,selectionJson);
    }
    else if(selectionJson.type == "gapcursor") {
        return GapCursor.fromJSON(doc,selectionJson);
    }
    else {
        return null;
    }
}

literatepagetransaction.commandInfo = {
    "type": "literatePageTransaction",
    "targetType": "component",
    "event": "updated"
}

CommandManager.registerCommand(literatepagetransaction);


