import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import {ApogeeView} from "/apogeeappview/apogeeAppViewLib.js";
import CombinedFileAccessAppConfigManager from "/webapp/fileaccess/CombinedFileAccessAppConfigManager.js"

//expose these apogee libraries globally so plugins can use them
window.apogeeutil = apogeeutil;
window.apogee = apogee;
window.apogeeapp = apogeeapp;
window.apogeeui = apogeeui;
window.apogeeview = apogeeview;

//implementation of global alert functions
//__globals__.apogeeLog = (msg) => console.log(message);
__globals__.apogeeUserAlert = (msg) => apogeeui.showSimpleActionDialog(msg,null,["OK"]);
__globals__.apogeeUserConfirm = (msg,okText,cancelText,okAction,cancelAction,defaultToOk) => apogeeui.showSimpleActionDialog(msg,null,[okText,cancelText],[okAction,cancelAction]);
__globals__.apogeeUserConfirmSynchronous = (msg,okText,cancelText,defaultToOk) => confirm(msg);

let appView;

window.init = function(includeBasePathInfo) {
    //initialize include directories
    apogeeview.initIncludePath(includeBasePathInfo);
    
    //use cutnpaste file access
    let appConfigManager = new CombinedFileAccessAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

window.beforeUnloadHandler = function(e) {
    var app = appView.getApp();
    if((app)&&(app.getWorkspaceIsDirty())) {
        return "There is unsaved data. Exit?";
    }
    else {
        return undefined;
    }
}
