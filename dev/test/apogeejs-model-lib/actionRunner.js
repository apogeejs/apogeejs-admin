import {Model,doAction} from "/apogeejs-model-lib/src/apogeeModelLib.js";


/////////////////////////////////////////////
// The functions here us the following structure, as a wrapper for the current data in the sequence.
// It is updated as the sequence is run.
//
// sequenceData = {
//     initialModel: This is the initial model
//     currentModel: This is the current model, and typically the model after the sequence
//     actionList: This is an array of actions to execute
//     listeners: These is a js object with listeners to be used if desired. They possible listeners are
//         member_created(model,action,actionIndex,member)
//         member_updated(model,action,actionIndex,member)
//         member_deleted(model,action,actionIndex,member)
//         model_updated(model,action,actionIndex,modelFromEvent)
//     results: This is an array of results, with the following format:
//          model: This is the model after the action completed
//          action: This is the action that was run
//          index: This is the index for the action in the action list. If the action was a later async action, the index will be -1
//          actionResult: this is the action result
// }

/** This method creates and loads a new model.
 * inputs
 * - sequenceData
 *     listeners - any desired listeners, if applicable
 * - initialModeJson - the json to load. This can be left as null if an empty model is desired.
 * 
 * outputs:
 * - sequenceData - this will be written into
 *     initialModel - the unloaded initial model
 *     currentModel - the final model
 *     results - the results from loading the model, and any other async actions.
*/
export function createModel(sequenceData,initialModelJson) {
    //create model
    sequenceData.initialModel = new Model(getModelRunContext(sequenceData));
    sequenceData.currentModel = sequenceData.initialModel;

    //load the model
    if(!initialModelJson) initialModelJson = Model.EMPTY_MODEL_JSON;
    let loadAction = {};
    loadAction.action = "loadModel";
    loadAction.modelJson = initialModelJson;
    
    return runActionOnModel(loadAction,0,sequenceData)
}

/** This method creates and loads a new model.
 * inputs:
 * - sequenceData
 *     initialModel - the input model
 *     actionList: This is an array of actions to execute
 *     listeners - any desired listeners, if applicable
 *     
 * outputs:
 * - sequenceData - this will be written into
 *     currentModel - the final model
 *     results - the results from loading the model, and any other async actions.
*/ 
export function runActionSequence(sequenceData) {
    sequenceData.currentModel = sequenceData.initialModel;
    let actionDone = true;
    for(let i = 0; i < sequenceData.actionList.length; i++) {
        let actionData = sequenceData.actionList[i];
        let actionDone = runActionOnModel(actionData,i,sequenceData);
        if(!actionDone) {
            actionDone = false;
        }
    };

    return actionDone;
}

/** This function should be called on the latest model, to destroy it. 
 * inputs:
 * - sequenceData
 *     initialModel - the input model
 *     listeners - any desired listeners, if applicable 
 * 
*/
export function destroyModel(sequenceData) {
    let oldModel = sequenceData.initialModel;
    let currentModel = oldModel.getMutableModel();
    addModelListeners(currentModel,listeners);
    currentModel.onClose(model);
}

////////////////////////////////////////////////////
// INTERNAL METHODS
////////////////////////////////////////////////////

/** This function adds listeners to the model. */
function addModelListeners(model,actionIndex,listeners) {
    if(listeners.memberCreated) model.addListener("member_created", member => listeners.memberCreated(model,action,actionIndex,member));
    if(listeners.memberUpdated) model.addListener("member_updated", member => listeners.memberUpdated(model,action,actionIndex,member));
    if(listeners.memberDeleted) model.addListener("member_deleted", member => listeners.memberDeleted(model,action,actionIndex,member));
    if(listeners.modelUpdated) model.addListener("model_updated", modelFromEvent => listeners.modelUpdated(model,action,actionIndex,modelFromEvent));
}

/** This gets the model run context that should be used for the model. */
function getModelRunContext(sequenceData) {
    let modelRunContext = {};
    modelRunContext.doAsynchActionCommand = (modelId,action) => runActionOnModel(action,-1,sequenceData);
    return modelRunContext;
}

/** This method runs the model, passing the result to the users actionCompleted function. */
function runActionOnModel(action,index,sequenceData) {
    //get a new mutable model to run the action on
    let oldModel = sequenceData.currentModel;
    let model = oldModel.getMutableModel();

    //add listeners, if included
    if(sequenceData.listeners) addModelListeners(model,sequenceData.listeners);

    //run the action
    let actionResult = doAction(model,action);

    //update the model only if the action was done successfully
    if(actionResult.actionDone) sequenceData.currentModel = model;

    //save the results in the sequence
    if(!sequenceData.results) sequenceData.results = [];
    sequenceData.results.push({model, index, action, actionResult});
    
    return actionResult.actionDone;
}



