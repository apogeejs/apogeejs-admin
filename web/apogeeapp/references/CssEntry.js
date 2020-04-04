import ReferenceEntry from "/apogeeapp/references/ReferenceEntry.js";
import {getLinkLoader} from "/apogeeapp/references/LinkLoader.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class CssEntry extends ReferenceEntry {
    
    constructor(referenceList,referenceData) {
        super(referenceList,referenceData,CssEntry.REFERENCE_TYPE_INFO);
    }


    /** This method loads the actual link. */
    implementationLoadEntry(onLoad,onError) {
        this.linkCallerId = getLinkLoader().createLinkCallerId();
        getLinkLoader().addLinkElement("css",this.getUrl(),this.getId(),onLoad,onError);
    }

    
    /** This method removes the link. It returns true if the link is removed. */
    removeEntry() {
        getLinkLoader().removeLinkElement("css",this.getUrl(),this.getId());
        return true;
    }
}

CssEntry.REFERENCE_TYPE = "css link";

