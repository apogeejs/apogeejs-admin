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

        this.viewStateCallback = null;
        this.cachedViewState = null;
    }

    getReferenceEntryType() {
        return referenceEntryType;
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    /** This methpod creates a reference entry. The referece entry must still be loaded, which
     * is an asynchronous process. 
     * This method returns a command result for creating the reference entry. The reference is 
     * contained in the "target" field of the command result. */
    createEntry(linkData) {
        let referenceEntry = new this.referenceEntryClass(this,linkData);
        this.referenceEntries.push(referenceEntry);
        return {
            cmdDone: true,
            target: referenceEntry,
            dispatcher: this,
            action: "created"
        }
    }
    
    close() {
        this.referenceEntries.forEach( referenceEntry => referenceEntry.remove() );
    }

    lookupEntry(url) {
        return this.referenceEntries.find(referenceEntry => referenceEntry.getUrl() == url);
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

    load(json) {
        let listCommandResults = [];
        let listLoadPromises = [];
        let loadEntry = entryJson => {
            
            //load this url if it doesn't exist
            if(!this.hasUrlEntry(entryJson.url)) {
                //create the entry (this does not actually load it)
                let commandResult =this.createEntry(entryJson);
                listCommandResults.push(commandResult);

                //load the entry - this will be asynchronous
                let referenceEntry = commandResult.target;
                var promise = referenceEntry.loadEntry();
                listLoadPromises.push(promise);
            }
        }
        json.entries.forEach(loadEntry);

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        return {listCommandResults,listLoadPromises};
    }

    toJson() {
        let json = {};
        json.entries = this.referenceEntries.map( entry => entry.toJson());

        //set the view state
        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }

        if(json.entries.length > 0) {
            return json;
        }
        else {
            return false;
        }
    }
}