import Apogee from "/apogeeapp/Apogee.js";
import ElectronAppConfigManager from "/supplemental/electronCode/ElectronAppConfigManager.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {apogeeui} from "/apogeeui/apogeeUiLib.js";
import ace from "/ext/ace/ace_1.4.3/ace_to_es6.js";

//expose these apogee libraries
__globals__.apogeeutil = apogeeutil;

export function appInit() {

    //initialize resource path
    apogeeui.initResourcePath("../../resources");

    //any needs mode or theme files for the ace editor should go in the folder set below
    ace.config.set('basePath','../../ext/ace/ace_1.4.3/ace_includes');
    
    //use electron file access
    var appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    Apogee.createApp("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    return Apogee.getInstance().getWorkspaceIsDirty();
}