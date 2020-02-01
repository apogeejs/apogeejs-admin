import "/apogee/webGlobals.js";
import ApogeeView from "/apogeeview/ApogeeView.js";
import { initIncludePath } from "/apogeeapp/apogeeAppLib.js";
import CutNPasteAppConfigManager from "/applications/cutnpastewebapp/CutNPasteAppConfigManager.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";


//expose these apogee libraries
window.apogeeutil = apogeeutil;

let appView;

window.init = function() {

    //initialize the include paths separately
    const includeBasePathStruct = {
        "resources": "/",
        "ace_includes": "/ext/ace/ace_1.4.3/"
    };
    initIncludePath(includeBasePathStruct);
    
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