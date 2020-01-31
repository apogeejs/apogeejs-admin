import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import EventManager from "/apogeeutil/EventManagerClass.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager extends EventManager {

    constructor() {
        super();
        
        //references
        this.referenceLists = {};
    }
    
    /** This method sets the reference types for the reference manager. 
     * This method returns a list of command results, for the creation of the reference lists.  */
    initReferenceLists(referenceClassArray) {
        commandResulList = {};
        referenceClassArray.forEach( referenceClass => {
            this.referenceLists[referenceClass.REFERENCE_TYPE] = new ReferenceList(referenceClass);
        });
    }
    
    getReferenceLists() {
        return this.referenceLists;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    openReferenceEntries(workspaceUI,referencesJson) {

        var entriesCommandResultList = [];
        var entryPromises = [];
        
        var loadEntry = entryJson => {
            var referenceList = this.referenceLists[referencesJson.entryType];
            
            if(!referenceList) throw new Error("Entry type nopt found: " + referenceJson.entryType);
            
            //load this url if it doesn't exist
            if(!referenceList.hasUrlEntry(entryJson.url)) {
                //create the entry (this does not actually load it)
                let commandResult = referenceList.createEntry(workspaceUI,entryJson);
                entriesCommandResultList.push(commandResult);

                //load the entry - this will be asynchronous
                let referenceEntry = commandResult.target;
                var promise = referenceEntry.loadEntry();
                entryPromises.push(promise);
            }
        }
        referenceJson.forEach(loadEntry);
        
        let openEntriesPromise = Promise.all(entryPromises);

        return {entriesCommandResultList,openEntriesPromise};
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    saveEntries() {
        var entriesJson = [];
        for(var referenceList in this.referenceLists) {
            let entryListJson = referenceList.getEntriesJson();
            entriesJson.push(...entryListJson);
        }
        return entriesJson;
    }

    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called.  */
    createEntry(workspaceUI,entryTypeString) {
        var referenceList = this.referenceLists[entryTypeString];
        if(!referenceList) throw new Error("Entry type nopt found: " + entryTypeString);

        return referenceList.createEntry(workspaceUI,entryJson);
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