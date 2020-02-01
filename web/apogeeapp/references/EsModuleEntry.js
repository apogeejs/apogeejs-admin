import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";

import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class EsModuleEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,EsModuleEntry.REFERENCE_TYPE_INFO);
    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        
        let commandResult = {};
        commandResult.target = this;
        commandResult.action = "updated";
            
        var onLoad = (module) => {
            //store the module return, if there is one
            //this is only used for cleanup
            this.module = module;
            if((module)&&(module.initApogeeModule)) module.initApogeeModule(apogee,apogeeapp,apogeeutil);
            
            commandResult.cmdDone = true;
            this.setClearState();
            resolve(commandResult);
        }

        var onError = (error) => {
            //I should read the error passed in for a better message!!!
            if(error.stack) console.error(error.stack);
            var errorMsg = error.message ? error.message : "Failed to load module " + this.url;
            //accept the error and keep going - it will be flagged in UI
            commandResult.cmdDone = true;
            commandResult.alertMsg = errorMsg;

            this.setError(errorMsg);
            resolve(commandResult);
        }
            
        this.setPendingState();
        var moduleLoadPromise = import(this.url).then(onLoad).catch(onError);

        //return promise to track loading finish
        return moduleLoadPromise;
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp,apogeeutil);

        this.referenceList.removeEntry(this);

        return {
            cmdDone: true,
            target: this,
            action: "deleted"
        }
    }
    
}

EsModuleEntry.REFERENCE_TYPE = "es module";

