import ReferenceEntry from "/apogeeapp/app/references/ReferenceEntry.js";

import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class EsModuleEntry extends ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,EsModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {
            
        var onLoad = (module) => {
            //store the module return, if there is one
            //this is only used for cleanup
            this.module = module;
            if((module)&&(module.initApogeeModule)) module.initApogeeModule(apogee,apogeeapp,apogeeutil);
            
            console.log("Module loaded: " + this.url);
            this.setClearState();
            return this.url;
        }

        var onError = (error) => {
            //I should read the error passed in for a better message!!!
            if(error.stack) console.error(error.stack);
            var errorMsg = error.message ? error.message : "Failed to load module " + this.url;
            this.setError(errorMsg);
            alert(errorMsg);
        }
            
        this.setPendingState();
        var moduleLoadPromise = import(this.url).then(onLoad).catch(onError);

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return moduleLoadPromise;
    }
    
    /** This method removes the link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp,apogeeutil);

        this.referenceManager.entryRemoved(this);
    }
    
}

EsModuleEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "es module",
    "LIST_NAME": "Web Modules",
    "ADD_ENTRY_TEXT":"Add ES Web Module",
    "UPDATE_ENTRY_TEXT":"Update Web Module",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/webModule.png",
    "createEntryFunction": (referenceManager, referenceData) => new EsModuleEntry(referenceManager,referenceData)
}


