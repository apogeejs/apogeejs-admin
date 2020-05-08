/**
 * AppRunContext
 * This is an interface definition for the Run Context for the App Layer.
 * The run context is used for asynchronous actions. An action must be run on a workspace
 * The workspace is immutable once the action completes. That means in an asynchronouse command
 * potentially a different workspace may be active by the time the asynchronous action resolves.
 * The run context should be used to run "future" commands like the ones that run when a promise
 * resolves.
 */

let AppRunContext = {};

AppRunContext.doFutureCommand = function(workspaceId,command,suppressFromHistory) {
    //implementation goes here, depending on how the application is wrapped.
}