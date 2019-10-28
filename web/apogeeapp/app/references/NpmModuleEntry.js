import ReferenceEntry from "/apogeeapp/app/references/ReferenceEntry.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class NpmModuleEntry extends ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,NpmModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            //synchronous loading
            try {
                this.module = require(this.url);
                if((this.module)&&(this.module.initApogeeModule)) this.module.initApogeeModule(apogee,apogeeapp);
                this.setClearState();
                resolve(this.url);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                if(error.stack) console.error(error.stack);
                var errorMsg = error.message ? error.message : "Failed to load module " + this.url;
                this.setError(errorMsg);
                reject(errorMsg);
            }
        }

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp);
        
        //we aren't really removing it...
        //require.undef(this.url);

        this.referenceManager.entryRemoved(this);
    }
    
}

NpmModuleEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "npm module",
    "LIST_NAME": "NPM Modules",
    "ADD_ENTRY_TEXT":"Add NPM Module",
    "UPDATE_ENTRY_TEXT":"Update NPM Module",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/module.png",
    "createEntryFunction": (referenceManager, referenceData) => new NpmModuleEntry(referenceManager,referenceData)
}


