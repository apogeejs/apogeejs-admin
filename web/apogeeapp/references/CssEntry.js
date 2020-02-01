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
    
    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. 
     * This is a command method. The promise returns a command result. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            let commandResult = {};
            commandResult.target = this;
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
                commandResult.alertMsg = errorMsg;

                this.setError(errorMsg);
                resolve(commandResult);
            }

            this.linkCallerId = getLinkLoader().createLinkCallerId();
            getLinkLoader().addLinkElement("css",this.url,this.linkCallerId,onLoad,onError);
        }

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        getLinkLoader().removeLinkElement("css",this.url,this.linkCallerId);
        
        this.referenceList.remvoeEntry(this);

        return {
            cmdDone: true,
            target: this,
            action: "deleted"
        }
    }
}

CssEntry.REFERENCE_TYPE = "css link";

