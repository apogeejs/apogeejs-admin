import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";
import {getLinkLoader} from "/apogeeapp/references/LinkLoader.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class JsScriptEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,JsScriptEntry.REFERENCE_TYPE_INFO);

    }

    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        this.linkCallerId = getLinkLoader().createLinkCallerId();
        getLinkLoader().addLinkElement("script",this.getUrl(),this.linkCallerId,onLoad,onError);
    }
    
    /** This method removes the link. */
    implementationRemoveEntry() {
        getLinkLoader().removeLinkElement("script",this.getUrl(),this.linkCallerId);
        return true;
    }
    
    _getLinkCallerHandle() {
        return "JsScriptEntry-" + this.getId();
    }
}

JsScriptEntry.REFERENCE_TYPE = "js link";


