import "/apogee/webGlobals.js";
import { Apogee, initIncludePath } from "/apogeeapp/apogeeAppLib.js";
import CutNPasteAppConfigManager from "/apogeeapp/impl/cutNPasteCode/CutNPasteAppConfigManager.js";
import util from "/apogeeutil/util.js";
import net from "/apogeeutil/net.js";

//expose these apogee libraries
window.apogee = {};
apogee.util = util;
apogee.net = net;

window.init = function() {

    //initialize resource path (relative to base path in web page)
    initIncludePath("");
    
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