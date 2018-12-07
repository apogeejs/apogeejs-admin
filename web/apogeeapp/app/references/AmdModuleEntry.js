/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
apogeeapp.app.AmdModuleEntry = class extends apogeeapp.app.ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,apogeeapp.app.AmdModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {
            //self installing module
            
            var onLoad = (module) => {
                //allow for an option module initialization step
                if((module)&&(module.initModule)) module.initModule(apogee,apogeeapp,this.referenceManager);
                this.module = module;
                
                console.log("Module loaded: " + this.url);
                this.setClearState();
                resolve(this.url);
            }
            var onError = (error) => {
                //I should read the error passed in for a better message!!!
                var errorMsg = "Failed to load module " + this.url;
                console.log(errorMsg);
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
        if((this.module)&&(this.module.removeModule)) this.module.removeModule(apogee,apogeeapp,this.referenceManager);
        
        require.undef(this.url);

        this.referenceManager.entryRemoved(this);
    }
    
}

apogeeapp.app.AmdModuleEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "amd module",
    "LIST_NAME": "Web Modules",
    "ADD_ENTRY_TEXT":"Add Web Module",
    "UPDATE_ENTRY_TEXT":"Update Web Module",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/module.png",
    "createEntryFunction": (referenceManager, referenceData) => new apogeeapp.app.AmdModuleEntry(referenceManager,referenceData)
}


