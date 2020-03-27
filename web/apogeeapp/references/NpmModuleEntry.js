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

    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {

        //synchronous loading
        try {
            let module = require(this.getUrl());
            if((module)&&(module.initApogeeModule)) module.initApogeeModule(apogee,apogeeapp,apogeeutil);
            this.setField("module",module);
            
            onLoad();
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            //accept the error and keep going - it will be flagged in UI
            commandResult.cmdDone = true;
            commandResult.errorMsg = errorMsg;

            onError(errorMsg);
        }

    }
    
    /** This method removes the link. */
    implementationRemoveEntry() {
        //allow for an optional module remove step
        let module = this.getField("module");
        if(module) {
            if(module.removeApogeeModule) module.removeApogeeModule(apogee,apogeeapp,apogeeutil);

            this.clearField("module");
        }
        
        //we aren't really removing it...
        //require.undef(this.url);

        return true;
    }
    
}

NpmModuleEntry.REFERENCE_TYPE = "npm module";

