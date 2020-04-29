import "/apogee/nodeGlobals.js";
import { ApogeeView, initIncludePath } from "/apogeeview/apogeeViewLib.js";
import ElectronAppConfigManager from "./ElectronAppConfigManager.js";

//expose these apogee libraries
__globals__.apogeeutil = apogeeutil;

let appView;

export function appInit() {

    /////////////////////////

    //initialize the include paths separately
    //this is from the web code
    // const includeBasePathStruct = {
    //     "resources": "/",
    //     "ace_includes": "/ext/ace/ace_1.4.3/"
    // };
    // initIncludePath(includeBasePathStruct);

    //initialize include path
    initIncludePath("./");
    
    //use cutnpaste file access
    let appConfigManager = new ElectronAppConfigManager();
    
    //create the application
    appView = new ApogeeView("appContainer",appConfigManager);
}

export function getWorkspaceIsDirty() {
    return Apogee.getInstance().getWorkspaceIsDirty();
}
