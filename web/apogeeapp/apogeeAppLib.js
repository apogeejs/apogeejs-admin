//This is a single module that exports the public items from the apogee app namespace
export {default as Apogee} from "/apogeeapp/app/Apogee.js";
export {default as BaseFileAccess} from "/apogeeapp/app/BaseFileAccess.js";

export {default as UiCommandMessenger} from "/apogeeapp/app/commands/UiCommandMessenger.js";

export {default as Component} from "/apogeeapp/app/component/Component.js";
export {default as EditComponent} from "/apogeeapp/app/component/EditComponent.js";

export {default as BasicControlComponent} from "/apogeeapp/app/components/BasicControlComponent.js";

export {default as AceTextEditor} from "/apogeeapp/app/datadisplay/AceTextEditor.js";
export {default as ConfigurableFormDisplay} from "/apogeeapp/app/datadisplay/ConfigurableFormDisplay.js";
export {default as ConfigurableFormEditor} from "/apogeeapp/app/datadisplay/ConfigurableFormEditor.js";
export {default as DataDisplay} from "/apogeeapp/app/datadisplay/DataDisplay.js";
export {default as dataDisplayHelper} from "/apogeeapp/app/datadisplay/dataDisplayCallbackHelper.js";
export {default as DATA_DISPLAY_CONSTANTS} from "/apogeeapp/app/datadisplay/dataDisplayConstants.js";
export {default as ErrorDisplay} from "/apogeeapp/app/datadisplay/ErrorDisplay.js";
export {default as HandsOnGridEditor} from "/apogeeapp/app/datadisplay/HandsOnGridEditor.js";
export {default as HtmlJsDataDisplay} from "/apogeeapp/app/datadisplay/HtmlJsDataDisplay.js";
export {default as TextAreaEditor} from "/apogeeapp/app/datadisplay/TextAreaEditor.js";

export {showConfigurableDialog} from "/apogeeapp/app/dialogs/ConfigurableDialog.js";

import apogeeui from "/apogeeapp/ui/apogeeui.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

/** This function initializes the resources path and the ace includes path. Both these folders should be
 * available in the sam directory. The argment includesBasePath gives the path prefix for these folders.
 */
export function initIncludePath(includeBasePath) {
    const RESOURCE_FOLDER_NAME = "resources";
    const ACE_INCLUDES_FOLDER_NAME = "ace_includes";

    let resourcesPath;
    let aceIncludesPath;

    if(includeBasePath == "") {
        resourcesPath = RESOURCE_FOLDER_NAME;
        aceIncludesPath = ACE_INCLUDES_FOLDER_NAME;
    }
    else if(includesBasepath.endWith("/")) {
        resourcesPath = includeBasePath + RESOURCE_FOLDER_NAME;
        aceIncludesPath = includeBasePath + ACE_INCLUDES_FOLDER_NAME;
    }
    else {
        resourcesPath = includeBasePath + "/" + RESOURCE_FOLDER_NAME;
        aceIncludesPath = includeBasePath + "/" + ACE_INCLUDES_FOLDER_NAME;
    }

    //initialize resource path (relative to base path in web page)
    apogeeui.initResourcePath(resourcesPath);

    //any needs mode or theme files for the ace editor should go in the folder set below (relative to base path in web page)
    ace.config.set('basePath',aceIncludesPath);
}


