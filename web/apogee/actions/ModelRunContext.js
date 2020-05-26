/**
 * ModelRunContext
 * This is an interface definition for the Run Context for the Model Layer.
 * The run context is used for asynchronous actions. An action must be run on a model.
 * The model is immutable once the action completes. That means in an asynchronouse action
 * potentially a different model may be active by the time the asynchronous action resolves.
 * The run context should be used to run "future" actions like the ones that run when a promise
 * resolves.
 */

let ModelRunContext = {};

ModelRunContext.doAsynchActionCommand = function(modelId,actionData) {
    //implementation goes here, depending on how the model is wrapped.
}