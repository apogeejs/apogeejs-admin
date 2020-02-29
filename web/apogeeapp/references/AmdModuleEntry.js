import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";

import * as apogee from "/apogee/apogeeCoreLib.js";
import * as apogeeapp from "/apogeeapp/apogeeAppLib.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class AmdModuleEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,AmdModuleEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            this.setPendingState();
            
            let commandResult = {};
            commandResult.target = this;
            commandResult.dispatcher = this;
            commandResult.action = "updated";

            //add event handlers
            var onLoad = () => {
                commandResult.cmdDone = true;

                this.setClearState();
                resolve(commandResult);
            }
            var onError = (error) => {
                var errorMsg = "Failed to load link '" + this.url + "':" + error;
                //accept the error and keep going - it will be flagged in UI
                commandResult.cmdDone = true;
                commandResult.errorMsg = errorMsg;

                this.setError(errorMsg);
                resolve(commandResult);
            }

            this.setPendingState();
            require([this.url],onLoad,onError);
        }

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        //allow for an optional module remove step
        if((this.module)&&(this.module.removeApogeeModule)) this.module.removeApogeeModule(apogee,apogeeapp,apogeeutil);
        require.undef(this.url);
        return true;
    }
    
}

AmdModuleEntry.REFERENCE_TYPE = "amd module";


