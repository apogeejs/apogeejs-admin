
import {apogeeui} from "/apogeeui/apogeeUiLib.js";

import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

export {default as ApogeeView} from "/apogeeview/ApogeeView.js";
export {default as ComponentView} from "/apogeeview/componentdisplay/ComponentView.js";

//needed just for web lib
export {default as WebComponentDisplay} from "/apogeeview/componentdisplay/webpage/WebComponentDisplay.js";

export {default as AceTextEditor} from "/apogeeview/datadisplay/AceTextEditor.js";
export {default as ConfigurableFormEditor} from "/apogeeview/datadisplay/ConfigurableFormEditor.js";
export {default as DataDisplay} from "/apogeeview/datadisplay/DataDisplay.js";
export {default as dataDisplayHelper} from "/apogeeview/datadisplay/dataDisplayHelper.js";
export {default as DATA_DISPLAY_CONSTANTS} from "/apogeeview/datadisplay/dataDisplayConstants.js";
export {default as ErrorDisplay} from "/apogeeview/datadisplay/ErrorDisplay.js";
export {default as HandsonGridEditor} from "/apogeeview/datadisplay/HandsonGridEditor.js";
export {default as HtmlJsDataDisplay} from "/apogeeview/datadisplay/HtmlJsDataDisplay.js";

export {showConfigurableDialog} from "/apogeeview/dialogs/ConfigurableDialog.js";

/** This function initializes the resources paths. Thuis covers the following paths
 * - "resources" folder - where the resource images are held
 * - "ace_includes" folder - where ace include files like themes are held
 * The argument includeBasePath can be either a string which is the common base path for the two above fodlers
 * or a object (map) including the folder name as the key and the assoicated base path as the value.
 */
export function initIncludePath(includesBasePath) {

    //read the individual base paths
    let resourceBasePath;
    let aceIncludesBasePath;
    if(typeof includesBasePath != "string") {
        resourceBasePath = includesBasePath.resources;
        aceIncludesBasePath = includesBasePath.ace_includes;
    }
    else {
        resourceBasePath = includesBasePath;
        aceIncludesBasePath = includesBasePath;
    }

    //initialize
    const RESOURCE_FOLDER_NAME = "resources";
    const ACE_INCLUDES_FOLDER_NAME = "ace_includes";

    let resourcesPath = _normalizeBasePath(resourceBasePath) + RESOURCE_FOLDER_NAME;
    let aceIncludesPath = _normalizeBasePath(aceIncludesBasePath) + ACE_INCLUDES_FOLDER_NAME;

    //initialize resource path (relative to base path in web page)
    apogeeui.initResourcePath(resourcesPath);

    //any needs mode or theme files for the ace editor should go in the folder set below (relative to base path in web page)
    ace.config.set('basePath',aceIncludesPath);
}

//The base path as three options:
// - "", meaning the local directory
// - "*/", meaning we can just append the folder name
// - other, meaning we need to add a "/" 
function _normalizeBasePath(basePath) {
    if((basePath != "")&&(!basePath.endsWith("/"))) {
        return basePath + "/";
    }
    else {
        return basePath;;
    }
}


