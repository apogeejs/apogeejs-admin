/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
apogeeapp.app.CssEntry = class extends apogeeapp.app.ReferenceEntry {
    
    constructor(referenceManager,referenceData) {
        super(referenceManager,referenceData,apogeeapp.app.CssEntry.REFERENCE_TYPE_INFO);
    }

    /** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    loadEntry() {

        var promiseFunction = (resolve,reject) => {

            var elementType = "link";
            
            //create link properties
            var linkProps = {};
            linkProps.id = this.getElementId();
            linkProps.rel = "stylesheet";
            linkProps.type = "text/css";
            linkProps.href = this.url;

            //add event handlers
            linkProps.onload = () => {
                this.setClearState();
                resolve(this.url);
            }
            linkProps.onerror = (error) => {
                var errorMsg = "Failed to load link '" + this.url + "'";
                this.setError(errorMsg);
                reject(errorMsg);
            }

            //insert the link entry
            this.setPendingState();
            var element = apogeeapp.ui.createElement(elementType,linkProps);
            document.head.appendChild(element);
        }

        //call link added to references
        this.referenceManager.entryInserted(this);

        //return promise to track loading finish
        return new Promise(promiseFunction);
    }
    
}

apogeeapp.app.CssEntry.REFERENCE_TYPE_INFO = {
    "REFERENCE_TYPE": "css link",
    "LIST_NAME": "CSS Links",
    "ADD_ENTRY_TEXT":"Add CSS Link",
    "UPDATE_ENTRY_TEXT":"Update CSS Link",
    "LIST_ICON_PATH":"/componentIcons/folder.png",
    "ENTRY_ICON_PATH": "/componentIcons/cssLink.png",
    "createEntryFunction": (referenceManager, linkData) => new apogeeapp.app.CssEntry(referenceManager,linkData)
}
