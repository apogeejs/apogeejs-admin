//some global definitions for the web browser environment
window.__globals__ = window;
window.__APOGEE_ENVIRONMENT__ = "WEB";

//these function should be replaced with an implementation at the appication level

/** This prints a message in the alert log */
__globals__.apogeeLog = (msg) => console.log(message);

/** This function asynchronously gives an alert the user */
__globals__.apogeeUserAlert = (msg) => undefined;

/** This function asynchronously lets the confirm or cancel an action. */
__globals__.apogeeUserConfirm = (title,msg,okText,cancelText,okAction,cancelAction,defaultToOk) => defaultToOk ? okAction : cancelAction;
