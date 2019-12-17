import "/apogee/nodeGlobals.js";
import { Apogee, initIncludePath } from "/apogeeapp/apogeeAppLib.js";
import ElectronAppConfigManager from "./ElectronAppConfigManager.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

//expose these apogee libraries
__globals__.apogeeutil = apogeeutil;

export function appInit() {

    //initialize include path
    initIncludePath("./");
    
    //use electron file access
    var appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    Apogee.createApp("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    return Apogee.getInstance().getWorkspaceIsDirty();
}