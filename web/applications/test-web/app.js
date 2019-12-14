import { Apogee, initIncludePath } from "/apogeeapp/apogeeAppLib.js";
import CutNPasteAppConfigManager from "/applications/cutnpastewebapp/CutNPasteAppConfigManager.js";
import {apogee} from "/apogeeutil/apogeeUtilLib.js";


//expose these apogee libraries
window.apogee = apogee;

window.init = function() {

    //initialize the include paths separately
    const includeBasePathStruct = {
        "resources": "/",
        "ace_includes": "/ext/ace/ace_1.4.3/"
    };
    initIncludePath(includeBasePathStruct);
    
    //use cutnpaste file access
    var appConfigManager = new CutNPasteAppConfigManager();
    
    //create the application
    Apogee.createApp("appContainer",appConfigManager);
}

function beforeUnloadHandler(e) {
    var app = Apogee.getInstance();
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