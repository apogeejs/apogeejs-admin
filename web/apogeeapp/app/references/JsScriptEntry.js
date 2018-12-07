/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
apogeeapp.app.JsScriptEntry = class extends apogeeapp.app.ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,apogeeapp.app.JsScriptEntry.REFERENCE_TYPE_INFO);

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

            this.linkCallerId = apogeeapp.app.getLinkLoader().createLinkCallerId();
            apogeeapp.app.getLinkLoader().addLinkElement("script",this.url,this.linkCallerId,onLoad,onError);
        }

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
    /** This method removes the link. */
    remove() {
        apogeeapp.app.getLinkLoader().removeLinkElement("script",this.url,this.linkCallerId);
        
        this.referenceManager.entryRemoved(this);
    }
    
    _getLinkCallerHandle() {
        return "JsScriptEntry-" + this.id;
    }
}

apogeeapp.app.JsScriptEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "js link",
    "LIST_NAME": "JS Scripts",
    "ADD_ENTRY_TEXT":"Add JS Script Link",
    "UPDATE_ENTRY_TEXT":"Update JS Script Link",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH":"/componentIcons/javascriptLink.png",
    "createEntryFunction": (referenceManager, linkData) => new apogeeapp.app.JsScriptEntry(referenceManager,linkData)
}


