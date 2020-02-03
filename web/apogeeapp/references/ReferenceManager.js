import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import ReferenceList from "/apogeeapp/references/ReferenceList.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager {

    constructor(app) {
        this.app = app;

        //references
        this.referenceLists = {};
    }
    
    /** This method sets the reference types for the reference manager. 
     * This method returns a list of command results, for the creation of the reference lists.  */
    initReferenceLists(referenceClassArray) {
        referenceClassArray.forEach( referenceClass => {
            this.referenceLists[referenceClass.REFERENCE_TYPE] = new ReferenceList(referenceClass);
        });
    }
    
    getReferenceLists() {
        return this.referenceLists;
    }

    getApp() {
        return this.app;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    openReferenceEntries(referencesJson) {

        var entriesCommandResultList = [];
        var entryPromises = [];
        
        var loadEntry = entryJson => {
            var referenceList = this.referenceLists[referencesJson.entryType];
            
            if(!referenceList) throw new Error("Entry type nopt found: " + referencesJson.entryType);
            
            //load this url if it doesn't exist
            if(!referenceList.hasUrlEntry(entryJson.url)) {
                //create the entry (this does not actually load it)
                let commandResult = referenceList.createEntry(entryJson);
                entriesCommandResultList.push(commandResult);

                //load the entry - this will be asynchronous
                let referenceEntry = commandResult.target;
                var promise = referenceEntry.loadEntry();
                entryPromises.push(promise);
            }
        }
        referencesJson.forEach(loadEntry);
        
        let openEntriesPromise = Promise.all(entryPromises);

        return {entriesCommandResultList,openEntriesPromise};
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    saveEntries() {
        var entriesJson = [];
        for(var referenceListType in this.referenceLists) {
            let referenceList = this.referenceLists[referenceListType];
            let entryListJson = referenceList.getEntriesJson();
            entriesJson.push(...entryListJson);
        }
        return entriesJson;
    }

    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called.  */
    createEntry(entryCommandData) {
        var referenceList = this.referenceLists[entryCommandData.entryType];
        if(!referenceList) throw new Error("Entry type nopt found: " + entryCommandData.entryType);

        return referenceList.createEntry(entryCommandData);
    }

    /** This method should be called when the parent is closed. It removes all links. 
     */
    close() {
        for(var listType in this.referenceLists) {
            var referenceList = this.referenceLists[listType];
            referenceList.close();
        }
    }

    lookupEntry(entryType,url) {
        var referenceList = this.referenceLists[entryType];
        if(referenceList) {
            return referenceList.lookupEntry(url);
        }
        else {
            return null;
        }
    }

    //=================================
    // Private
    //=================================
   
}