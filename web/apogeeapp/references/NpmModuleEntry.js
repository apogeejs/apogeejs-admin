import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";

import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class NpmModuleEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,NpmModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            let commandResult = {};
            commandResult.target = this;
            commandResult.action = "updated";

            //synchronous loading
            try {
                this.module = require(this.url);
                if((this.module)&&(this.module.initApogeeModule)) this.module.initApogeeModule(apogee,apogeeapp,apogeeutil);
                
                commandResult.cmdDone = true;
                this.setClearState();
                resolve(commandResult);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                if(error.stack) console.error(error.stack);
                //accept the error and keep going - it will be flagged in UI
                commandResult.cmdDone = true;
                commandResult.alertMsg = errorMsg;

                this.setError(errorMsg);
                resolve(commandResult);
            }
        }

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp,apogeeutil);
        
        //we aren't really removing it...
        //require.undef(this.url);

        return true;
    }
    
}

NpmModuleEntry.REFERENCE_TYPE = "npm module";

