//some global definitions for the node environment
global.__globals__ = global;
global.__APOGEE_ENVIRONMENT__ = "NODE";

//these function should be replaced with an implementation at the appication level

/** This prints a message in the alert log */
__globals__.apogeeLog = (msg) => console.log(message);

/** This function asynchronously gives an alert the user */
__globals__.apogeeUserAlert = (msg) => undefined;

/** This function asynchornously lets the confirm or cancel an action. */
__globals__.apogeeUserConfirm = (msg,okText,cancelText,okAction,cancelAction,defaultToOk) => defaultToOk ? okAction : cancelAction;

/** This synchronous funtion returns true or false for ok or cancel. */
__globals__.apogeeUserConfirmSynchronous = (msg,okText,cancelText,defaultToOk) => defaultToOk;

//a global def we wil use in UI
// declare global: os, navigator
__globals__.__OS_IS_MAC__ = typeof navigator != "undefined" ? /Mac/.test(navigator.platform)
    : typeof os != "undefined" ? os.platform() == "darwin" : false;