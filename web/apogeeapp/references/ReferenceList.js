import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import FieldObject from "/apogeeutil/FieldObject.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceList extends FieldObject {

    constructor(referenceEntryClass,instanceToCopy,keepUpdatedFixed) {
        super("referenceList",instanceToCopy,keepUpdatedFixed);

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
            eventAction: "created"
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

    /** This method loads the reference list. It returns a list of command results
     * for the initial creation of the entries in the list. 
     * In onListLoadCompleted is passed, it will be called with a list of the command results 
     * for each entry when all entries commplete loading. */
    load(workspaceManager,json,onListLoadCompleted) {
        let listCommandResults = [];
        let listLoadPromises = [];

        //construct the load function
        let loadEntry = entryJson => {
            
            //load this url if it doesn't exist
            if(!this.hasUrlEntry(entryJson.url)) {
                //create the entry (this does not actually load it)
                let commandResult =this.createEntry(entryJson);
                listCommandResults.push(commandResult);

                //construct a promise from the callback and store it
                let entryPromiseFunction = (resolve,reject) => {
                    let onLoadComplete = loadCompleteCommandResult => resolve(loadCompleteCommandResult);
                
                    //load the entry - this will be asynchronous
                    let referenceEntry = commandResult.target;
                    referenceEntry.loadEntry(workspaceManager,onLoadComplete);
                }
                listLoadPromises.push(new Promise(entryPromiseFunction));
            }
        }

        //load each entry
        json.entries.forEach(loadEntry);

        //set the view state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }

        if(onListLoadCompleted) {
            listLoadPromises.all().then(onListLoadCompleted)
        }

        return listCommandResults;
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