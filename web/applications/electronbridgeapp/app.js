import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import ElectronBridgeAppConfigManager from "/applications/electronbridgeapp/ElectronBridgeAppConfigManager.js";

//expose these apogee libraries globally so plugins can use them
window.apogeeutil = apogeeutil;
window.apogee = apogee;
window.apogeeapp = apogeeapp;
window.apogeeui = apogeeui;
window.apogeeview = apogeeview;

let appView;

window.init = function(includeBasePathInfo) {
    //initialize the include paths separately
    initIncludePath(includeBasePathInfo);
    
    //use cutnpaste file access
    let appConfigManager = new ElectronBridgeAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

window.getWorkspaceIsDirty = function() {
    return appView.getApp().getWorkspaceIsDirty();
}
