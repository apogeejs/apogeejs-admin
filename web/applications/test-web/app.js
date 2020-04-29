import "/apogee/webGlobals.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeui from "/apogeeui/apogeeUiLib.js";
import * as apogeeview from "/apogeeview/apogeeViewLib.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import CutNPasteAppConfigManager from "/applications/cutnpastewebapp/CutNPasteAppConfigManager.js";

//expose these apogee libraries globally so plugins can use them
window.apogeeutil = apogeeutil;
window.apogee = apogee;
window.apogeeapp = apogeeapp;
window.apogeeui = apogeeui;
window.apogeeview = apogeeview;

let appView;

window.init = function() {

    //initialize the include paths separately
    const includePathInfo = {
        "resources": "/resources",
        "aceIncludes": "/ext/ace/ace_1.4.3/ace_includes"
    };
    initIncludePath(includePathInfo);
    
    //use cutnpaste file access
    let appConfigManager = new CutNPasteAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

function beforeUnloadHandler(e) {
    var app = appView.getApp();
    if((app)&&(app.getWorkspaceIsDirty())) {
        console.log("Closing with unsaved data - It should query the user!");
        e.preventDefault();
        return "There is unsaved data. Exit?";
    }
    else {
        return undefined;
    }
}

window.addEventListener("beforeunload", beforeUnloadHandler);