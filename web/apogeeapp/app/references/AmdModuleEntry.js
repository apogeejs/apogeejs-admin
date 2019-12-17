import ReferenceEntry from "/apogeeapp/app/references/ReferenceEntry.js";

import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import * as apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class AmdModuleEntry extends ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,AmdModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {
            
            var onLoad = (module) => {
                //store the module return, if there is one
                //this is only used for cleanup
                this.module = module;
                if((module)&&(module.initApogeeModule)) module.initApogeeModule(apogee,apogeeapp,apogeeutil);
                
                console.log("Module loaded: " + this.url);
                this.setClearState();
                resolve(this.url);
            }
            var onError = (error) => {
                //I should read the error passed in for a better message!!!
                if(error.stack) console.error(error.stack);
                var errorMsg = error.message ? error.message : "Failed to load module " + this.url;
                this.setError(errorMsg);
                reject(errorMsg);
            }
            
            this.setPendingState();
            require([this.url],onLoad,onError);
        }

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp,apogeeutil);
        
        require.undef(this.url);

        this.referenceManager.entryRemoved(this);
    }
    
}

AmdModuleEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "amd module",
    "LIST_NAME": "Web Modules",
    "ADD_ENTRY_TEXT":"Add Web Module",
    "UPDATE_ENTRY_TEXT":"Update Web Module",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/webModule.png",
    "createEntryFunction": (referenceManager, referenceData) => new AmdModuleEntry(referenceManager,referenceData)
}


