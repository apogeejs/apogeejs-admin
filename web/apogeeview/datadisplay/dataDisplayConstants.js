import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/** 
 * This namespace includes some data display constants.
 * @namespace
 */
let DATA_DISPLAY_CONSTANTS = {};

export {DATA_DISPLAY_CONSTANTS as default};

//these are responses to hide request and close request
DATA_DISPLAY_CONSTANTS.UNSAVED_DATA = -1;
DATA_DISPLAY_CONSTANTS.CLOSE_OK = 1;

//this should probably go somewhere else
DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

//display view size constants
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME = "resize_height_mode_some";
DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX = "resize_height_mode_max";

DATA_DISPLAY_CONSTANTS.RESIZE_SHOW_FLAG = 1;
DATA_DISPLAY_CONSTANTS.RESIZE_MODE_MAX_FLAG = 2;
DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_LESS_FLAG = 4;
DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MORE_FLAG = 8;
DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MAX_FLAG = 16;

//These are the typesof messages that can be posted to the display container
DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE = "none";
DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR = "error";
DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_WARNING = "warning";
DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO = "info";

//The data source should return data with this key and value to signify the return data is encapsulated
//in addition to the key and value below. The following fields are allowed:
// - data - this is the data to display (optional)
// - messageType - this is the message type (optional)
// - message - this is the message (optional)
// - removed - this is set to true if we want to display removed, or false otherwise (optional) 
DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_KEY = "wrapped_data";
DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE = {}; //must use this exactly, not a copy

/** This function returns true if the passed in data is wrapped data. */
DATA_DISPLAY_CONSTANTS.isWrappedData = function(data) {
    if(!data) return false;
    return (data[DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_KEY] == DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE);
}

/** This function returns empty wrapped data, since it can be cumbersome to construct. The return
 * value can be modified by adding additional fields. */
DATA_DISPLAY_CONSTANTS.getEmptyWrappedData = function() {
    let wrappedData = {};
    wrappedData[DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_KEY] = DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE;
    return wrappedData;
}

/** This is the standard wrapped data value for invalid data. It will print a message the data is not
 * available and it will hide the display. This value is constant and should not be modified. */
DATA_DISPLAY_CONSTANTS.STANDARD_INVALID_WRAPPED_DATA = apogeeutil.deepFreeze(
    {
        "wrapped_data": DATA_DISPLAY_CONSTANTS.WRAPPED_DATA_VALUE,
        "data": apogeeutil.INVALID_VALUE,
        "messageType": DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO,
        "message": "Data Unavailable",
        "hideDisplay": true
    }
)

/** This function reads data, handling wrapped or unwrapped data.
 * Wrapped Data Options:
 * - data - This is the data to pass return
 * - messageType - This is the type of message to show. The option are none, error, warning and info. The message can be shown
 *      even if the display is not hidden (which is not true for display data).
 * - message - This is the message to show.
 * - hideDisplay - If this is true, the main display element will not be shown.
 * - removeView - If this is true, the entire data view will be removed, as if it were not there.
 * 
 * Unwrapped Data:
 * If the data is not wrapped, the return value is the data. If this value is apogeeutil.INVALID_VALUE, hideDisplay
 * will be set to true and a default message will be shown.
 * 
 * The return values is:
 *  {data,messageType,message,hideDisplay,removeView}
 */
DATA_DISPLAY_CONSTANTS.readWrappedData = function(getDataFunction,errorPrefix) {
    
    let data;
    let messageType;
    let message;
    let hideDisplay;
    let removeView;

    try {
        //load data from data source
        let dataReturn
        if(getDataFunction) {
            dataReturn = getDataFunction();
        }
        else {
            dataReturn = apogeeutil.INVALID_VALUE;
        }

        //load data display values
        if((dataReturn)&&(DATA_DISPLAY_CONSTANTS.isWrappedData(dataReturn))) {
            //handle a wrapped return value
            data = dataReturn.data;
            messageType = dataReturn.messageType;
            message = dataReturn.message;
            removeView = dataReturn.removeView;
            hideDisplay = dataReturn.hideDisplay;
        }
        else {
            //straight data was returned
            data = dataReturn;
            hideDisplay = (data === apogeeutil.INVALID_VALUE);
        }
    }
    catch(error) {
        //hide dispay and show error message
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        message = errorPrefix + error.toString();
        removeView = false;
        hideDisplay = true;
        data = apogeeutil.INVALID_VALUE;

        if(error.stack) console.error(error.stack);
    }

    //set values that have not be set
    if(messageType === undefined) {
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
        message = "";
    }
    hideDisplay = hideDisplay ? true : false;
    removeView = removeView ? true : false;

    return {data,messageType,message,hideDisplay,removeView};
}

/** This function reads display data, handling wrapped or unwrapped data.
 * Wrapped Data Options:
 * - data - this is the data to pass to the dispaly
 * - displayInvalid - if this is true the display is hidden and a message is shown. 
 * - messageType - This is the type of message to show. This is valid only if the display is invalid and ignored otherwise.
 *      If a message will be shown and this is not set, the message type wil be error.
 * - message - This is the message to show.
 * 
 * Unwrapped Data:
 * If the data is not wrapped, the return value is the data. If this value is apogeeutil.INVALID_VALUE, displayInvalid
 * will be set to true and a default message will be shown.
 * 
 * The return values is:
 *  {data,displayInvalid,messageType,message}
 */
DATA_DISPLAY_CONSTANTS.readWrappedDisplayData = function(getDataFunction,errorPrefix) {
    
    let data;
    let messageType;
    let message;
    let displayInvalid;

    try {
        //load data from data source
        let dataReturn
        if(getDataFunction) {
            dataReturn = getDataFunction();
        }
        else {
            dataReturn = apogeeutil.INVALID_VALUE;
        }

        //load data display values
        if((dataReturn)&&(DATA_DISPLAY_CONSTANTS.isWrappedData(dataReturn))) {
            //handle a wrapped return value
            data = dataReturn.data;
            displayInvalid = dataReturn.displayInvalid;
            messageType = dataReturn.messageType;
            message = dataReturn.message;
        }
        else {
            //straight data was returned
            data = dataReturn;
            displayInvalid = (data === apogeeutil.INVALID_VALUE);
        }
    }
    catch(error) {
        //hide dispay and show error message
        messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        message = errorPrefix + error.toString();
        displayInvalid = true;
        data = apogeeutil.INVALID_VALUE;

        if(error.stack) console.error(error.stack);
    }

    //fill in the message type and message if they are not set
    //by default, set message type to error
    if(displayInvalid) {
        if(messageType === undefined) messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR;
        if(message === undefined) message = "Data unavailable";
    }

    return {data,displayInvalid,messageType,message};
}
