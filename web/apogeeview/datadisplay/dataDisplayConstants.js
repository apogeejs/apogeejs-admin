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


