import Apogee from "/apogeeapp/app/Apogee.js";
import ElectronAppConfigManager from "/apogeeapp/impl/electronCode/ElectronAppConfigManager.js";
import util from "/apogeeutil/util.js";
import net from "/apogeeutil/net.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

//expose these apogee libraries
__globals__.apogee = {};
apogee.util = util;
apogee.net = net;

export function appInit() {

    //========================================
    //resource paths
    //initialize resource path
    apogeeui.initResourcePath("./resources");

    //any needs mode or theme files for the ace editor should go in the folder set below
    ace.config.set('basePath','./ace_includes');
    //=========================================
    
    //use electron file access
    var appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    Apogee.createApp("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    return Apogee.getInstance().getWorkspaceIsDirty();
}