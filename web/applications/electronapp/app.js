import "/apogee/nodeGlobals.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import ElectronAppConfigManager from "./ElectronAppConfigManager.js";

//expose these apogee libraries globally so plugins can use them
__globals__.apogeeutil = apogeeutil;
__globals__.apogee = apogee;
__globals__.apogeeapp = apogeeapp;
__globals__.apogeeui = apogeeui;
__globals__.apogeeview = apogeeview;

let appView;

export function appInit() {

    //initialize the include paths separately
    const includePathInfo = {
        "resources": "./resources",
        "aceIncludes": "./ace_includes"
    };
    initIncludePath(includePathInfo);
    
    //use cutnpaste file access
    let appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    return appView.getApp().getWorkspaceIsDirty();
}
