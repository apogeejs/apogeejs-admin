import Apogee from "/apogeeapp/app/Apogee.js";
import CutNPasteAppConfigManager from "/apogeeapp/impl/cutNPasteCode/CutNPasteAppConfigManager.js";
import util from "/apogeeutil/util.js";
import net from "/apogeeutil/net.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

//expose these apogee libraries
window.apogee = {};
apogee.util = util;
apogee.net = net;

window.init = function() {

    //initialize resource path (relative to base path in web page)
    apogeeui.initResourcePath("resources");

    //any needs mode or theme files for the ace editor should go in the folder set below (relative to base path in web page)
    ace.config.set('basePath','ace_includes');
    
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