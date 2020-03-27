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
            
    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        let localOnLoad = (module) => {
            if((module)&&(module.initApogeeModule)) module.initApogeeModule(apogee,apogeeapp,apogeeutil);
            this.setField("module",module);
        }

        //load the module
        var moduleLoadPromise = import(this.url).then(localOnLoad).catch(onError);
    }
    
    /** This method removes the link. This returns a command result for the removed link. */
    implementationRemoveEntry() {
        //allow for an optional module remove step
        let module = this.getField("module");
        if(module) {
            if(module.removeApogeeModule) module.removeApogeeModule(apogee,apogeeapp,apogeeutil);
            this.clearField("module");
        }
        return true;
    }
    
}

EsModuleEntry.REFERENCE_TYPE = "es module";

