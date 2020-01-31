import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import EventManager from "/apogeeutil/EventManagerClass.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceList extends EventManager {

    constructor(referenceEntryClass) {
        super();

        this.referenceEntryType = referenceEntryClass.REFERENCE_TYPE;
        this.referenceEntryClass = referenceEntryClass;
        this.referenceEntries = [];
    }

    getReferenceEntryType() {
        return referenceEntryType;
    }

    /** This methpod creates a reference entry. The referece entry must still be loaded, which
     * is an asynchronous process. 
     * This method returns a command result for creating the reference entry. The reference is 
     * contained in the "target" field of the command result. */
    createEntry(workspaceUI,linkData) {
        let referenceEntry = new referenceEntryClass(this,linkData);
        this.referenceEntries.push(referenceEntry);
        return {
            cmdDone: true,
            target: referenceEntry,
            parent: workspaceUI,
            type: "created"
        }
    }
    
    close() {
        this.referenceEntries.forEach( referenceEntry => referenceEntry.remove() );
    }

    lookupEntry(url) {
        this.referecneEntries.find(referenceEntry => referenceEntry.getUrl() == url);
    }

    removeEntry(referenceEntry) {
        this.referenceEntries = this.referenceEntries.filter( existingEntry => (existingEntry != referenceEntry) );
    }

    hasUrlEntry(url) {
        return this.referenceEntries.some( refEntry => (refEntry.getUrl() == url) );
    }

    getEntriesJson() {
        return this.referenceEntries.map(refEntry => refEntry.saveEntry());
    }


    //------------------------------------------
    // Event Tracking Methods
    //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    getEventId() {
        //use the main member for the event ID
        return "link-" + this.id;
    }
}