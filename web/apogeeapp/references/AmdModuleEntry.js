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

    /** This method loads the actual module. */
    implementationLoadEntry(onLoad,onError) {

        //create local callbacks that make the callbacks asynchronous!
        let localOnLoad = () => {
            setTimeout(onLoad,0);
        }
        let localOnError = error => {
            setTimeout(() => onError(error),0);
        }

        //synchronous loading
        require([this.getUrl()],localOnLoad,localOnError);
        
    }
    
    /** This method removes the module. */
    implementationRemoveEntry() {
        //allow for an optional module remove step
        require.undef(this.url);
    }
    
}

AmdModuleEntry.REFERENCE_TYPE = "amd module";


