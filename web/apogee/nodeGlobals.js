//some global definitions for the node environment
global.__globals__ = global;
global.__APOGEE_ENVIRONMENT__ = "NODE";

//these function should be replaced with an implementation at the appication level

/** This prints a message in the alert log */
__globals__.apogeeLog = (msg) => console.log(message);

/** This function asynchronously gives an alert the user */
__globals__.apogeeUserAlert = (msg) => undefined;

/** This function lets the confirm or cancel an action. */
__globals__.apogeeUserConfirm = (title,msg,okText,cancelText,okAction,cancelAction,defaultToOk) => defaultToOk ? okAction : cancelAction;