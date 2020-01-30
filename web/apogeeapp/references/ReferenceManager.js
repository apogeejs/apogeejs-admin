import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 
import EsModuleEntry from "/apogeeapp/references/EsModuleEntry.js";
import NpmModuleEntry from "/apogeeapp/references/NpmModuleEntry.js";
import JsScriptEntry from "/apogeeapp/references/JsScriptEntry.js";
import CssEntry from "/apogeeapp/references/CssEntry.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager extends EventManager {

    constructor(app) {
        super();
        this.app = app;
        this.state = bannerConstants.BANNER_TYPE_NORMAL;
        
        //references
        this.referenceLists = {};
        if(__APOGEE_ENVIRONMENT__ == "WEB") this.referenceLists[EsModuleEntry.REFERENCE_TYPE] = this.getListStruct(EsModuleEntry);
        if(__APOGEE_ENVIRONMENT__ == "NODE") this.referenceLists[NpmModuleEntry.REFERENCE_TYPE] = this.getListStruct(NpmModuleEntry);
        this.referenceLists[JsScriptEntry.REFERENCE_TYPE] = this.getListStruct(JsScriptEntry);
        this.referenceLists[CssEntry.REFERENCE_TYPE] = this.getListStruct(CssEntry);
    }

    /** This method returns the state of the reference manager. */
    getState() {
        return this.state;
    }   
    
    /** This method returns the state of the given reference list. If the list is not
     * found, bannerConstants.BANNER_TYPE_ERROR is returned. */
    getReferenceListState(entryType) {
        referenceList = this.referenceLists[entryType];
        if(referenceList) {
            return referenceList.state;
        }
        else {
            //unknown list - return error state
            return bannerConstants.BANNER_TYPE_ERROR;
        }
    }

    getApp() {
        return this.app;
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    getOpenEntriesPromise(referencesJson) {

        var entryPromises = [];
        
        var loadEntry = entryJson => {
            var listStruct = this.referenceLists[entryJson.entryType];
            
            if(!listStruct) throw new Error("Entry type nopt found: " + entryJson.entryType);
            
            //load this url if it doesn't exist
            if(!listStruct.listEntries.some( listEntry => (listEntry.url == entryJson.url) )) {
                var referenceEntry = listStruct.typeInfo.createEntryFunction(this,entryJson);
                var promise = referenceEntry.loadEntry();
                entryPromises.push(promise);
            }
        }
        referencesJson.forEach(loadEntry);
        
        return Promise.all(entryPromises);
    }

    /** This method opens the reference entries, from the structure returned from
     * the save call. It returns a promise that
     * resolves when all entries are loaded. 
     */
    saveEntries() {
        var entryListJson = [];
        var saveEntry = listEntry => {
            var entryJson = listEntry.saveEntry();
            entryListJson.push(entryJson);
        }
        
        for(var listType in this.referenceLists) {
            var listStruct =  this.referenceLists[listType];
            listStruct.listEntries.forEach(saveEntry);
        }
    
        return entryListJson;
    }

    /** This method creates a reference entry. This does nto however load it, to 
     * do that ReferenceEntry.loadEntry() method must be called.  */
    createEntry(entryTypeString) {
        
        //check if these object exist - if so, don't add them
    
        var listStruct = this.referenceLists[entryTypeString];
        
        if(!listStruct) throw new Error("Entry type nopt found: " + entryTypeString);
        
        var referenceEntry = listStruct.createEntryFunction(this,entryJson);
        return referenceEntry;
    }

    /** This method should be called when the parent is closed. It removes all links. 
     */
    close() {
        for(var listType in this.referenceLists) {
            var listStruct = this.referenceLists[listType];
            listStruct.listEntries.forEach( referenceEntry => referenceEntry.remove() );
        }
    }

    lookupEntry(entryType,url) {
        var listStruct = this.referenceLists[entryType];
        if(listStruct) {
            return listStruct.listEntries.find(referenceEntry => referenceEntry.getUrl() == url);
        }
        else {
            return null;
        }
    }
    //================================
    // Protected
    //================================

    /** This method opens a list of js and css links. It returns a promise that
     * resolves when all links are loaded. 
     * @protected */
    entryInserted(referenceEntry) {
        var entryType = referenceEntry.getEntryType();
        
        var listStruct = this.referenceLists[entryType];
        if(!listStruct) {
            throw new Error("Unrecognized link type: " + entryType);
        }
        
        listStruct.listEntries.push(referenceEntry);

        //FIRE ENTRY ADDED?
        //onEntryAdded(referencentry)
    }


    /** This method opens a list of js and css links. It returns a promise that
     * resolves when all links are loaded. 
     * @protected */
    entryStatusChange(referenceEntry) {
        //just check all entries for find state
        this.processReferenceState();
    }

    /** This method opens a list of js and css links. It returns a promise that
     * resolves when all links are loaded. 
     * @protected */
    entryRemoved(referenceEntry) {
        var entryType = referenceEntry.getEntryType();
        
        var listStruct = this.referenceLists[entryType];
        if(!listStruct) {
            throw new Error("Unrecognized link type: " + entryType);
        }
        
        listStruct.listEntries = listStruct.listEntries.filter( existingEntry => (existingEntry != referenceEntry) );
        listStruct.treeEntry.removeChild(referenceEntry.getTreeEntry());
    }

    //=================================
    // Private
    //=================================

    getListStruct(referenceEntryClass) {
        var listStruct = {};
        listStruct.createEntryFunction = (referenceManager, linkData) => new referenceEntryClass(referenceManager,linkData);
        listStruct.listEntries = [];
        listStruct.treeEntry = null;
        listStruct.state = bannerConstants.BANNER_TYPE_NORMAL;
        return listStruct;
    }

    /** This method opens a list of js and css links. It returns a promise that
     * resolves when all links are loaded. 
     * @private */
    processReferenceState() {
        //just check all entries for find state
        var hasError = false;
        var hasPending = false;
        
        for(var listType in this.referenceLists) {
            var listStruct = this.referenceLists[listType];
            
            var listState = this.getListState(listStruct);
            
            if(listState == bannerConstants.BANNER_TYPE_ERROR) hasError = true;
            else if(listState == bannerConstants.BANNER_TYPE_PENDING) hasPending = true;
        }
            
        var newState;
        if(hasError) {
            newState = bannerConstants.BANNER_TYPE_ERROR;
        }
        else if(hasPending) {
            newState = bannerConstants.BANNER_TYPE_PENDING;
        }
        else {
            newState = bannerConstants.BANNER_TYPE_NORMAL;
        }
        
        if(this.state != newState) {
            this.state = newState;
            if(this.referencesTreeEntry) this.referencesTreeEntry.setBannerState(newState);
        }
    }

    /** This gets and applies the list state for a reference list. 
     * @private */
    getListState(listStruct) {
        var hasError = false;
        var hasPending = false;
        
        var checkStatus = refEntry => {
            var state = refEntry.getState();
            if(state == bannerConstants.BANNER_TYPE_ERROR) {
                hasError = true;
            }
            else if(state == bannerConstants.BANNER_TYPE_PENDING) {
                hasPending = true;
            }
        }
            
        listStruct.listEntries.forEach(checkStatus);
            
        var listState;
        if(hasError) {
            listState = bannerConstants.BANNER_TYPE_ERROR;
        }
        else if(hasPending) {
            listState = bannerConstants.BANNER_TYPE_PENDING;
        }
        else {
            listState = bannerConstants.BANNER_TYPE_NORMAL;
        }
        
        if(listState != listStruct.state) {
            listStruct.state = listState;
            if(listStruct.treeEntry) listStruct.treeEntry.setBannerState(listState); 
        }
        
        return listState;
    }
}