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

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

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

            this.linkCallerId = getLinkLoader().createLinkCallerId();
            getLinkLoader().addLinkElement("script",this.url,this.linkCallerId,onLoad,onError);
        }

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        getLinkLoader().removeLinkElement("script",this.url,this.linkCallerId);
        return true;
    }
    
    _getLinkCallerHandle() {
        return "JsScriptEntry-" + this.id;
    }
}

JsScriptEntry.REFERENCE_TYPE = "js link";


