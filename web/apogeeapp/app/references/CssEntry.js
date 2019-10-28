import ReferenceEntry from "/apogeeapp/app/references/ReferenceEntry.js";
import {getLinkLoader} from "/apogeeapp/app/references/LinkLoader.js";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
export default class CssEntry extends ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,CssEntry.REFERENCE_TYPE_INFO);
    }
    
    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            //add event handlers
            var onLoad = () => {
                this.setClearState();
                resolve(this.url);
            }
            var onError = (error) => {
                var errorMsg = "Failed to load link '" + this.url + "'";
                this.setError(errorMsg);
                reject(errorMsg);
            }

            this.linkCallerId = getLinkLoader().createLinkCallerId();
            getLinkLoader().addLinkElement("css",this.url,this.linkCallerId,onLoad,onError);
        }

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        getLinkLoader().removeLinkElement("css",this.url,this.linkCallerId);
        
        this.referenceManager.entryRemoved(this);
    }
}

CssEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "css link",
    "LIST_NAME": "CSS Links",
    "ADD_ENTRY_TEXT":"Add CSS Link",
    "UPDATE_ENTRY_TEXT":"Update CSS Link",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH": "/componentIcons/cssLink.png",
    "createEntryFunction": (referenceManager, linkData) => new CssEntry(referenceManager,linkData)
}
