import Apogee from "/apogeeapp/Apogee.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import ElectronAppConfigManager from "/applications/electronapp/ElectronAppConfigManager.js";

//expose these apogee libraries globally so plugins can use them
__globals__.apogeeutil = apogeeutil;
__globals__.apogee = apogee;
__globals__.apogeeapp = apogeeapp;
__globals__.apogeeui = apogeeui;
__globals__.apogeeview = apogeeview;

let appView;

export function appInit() {

    //initialize the include paths separately
    const includeBasePathStruct = {
        "resources": "../../resources",
        "aceIncludes": "../../ext/ace/ace_1.4.3/ace_includes"
    };
    initIncludePath(includeBasePathStruct);
    
    //use electron file access
    var appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    var app = appView.getApp();
    return app.getWorkspaceIsDirty();
}