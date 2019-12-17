import {addLink} from "/apogeeapp/app/commandseq/updatelinkseq.js";
import {bannerConstants} from "/apogeeapp/app/component/banner.js"; 
import EsModuleEntry from "/apogeeapp/app/references/EsModuleEntry.js";
import NpmModuleEntry from "/apogeeapp/app/references/NpmModuleEntry.js";
import JsScriptEntry from "/apogeeapp/app/references/JsScriptEntry.js";
import CssEntry from "/apogeeapp/app/references/CssEntry.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import TreeEntry from "/apogeeapp/ui/treecontrol/TreeEntry.js";

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
export default class ReferenceManager {

    constructor(app) {
        this.app = app;
        this.referencesTreeEntry = null;
        this.state = bannerConstants.BANNER_TYPE_NORMAL;
        
        //references
        this.referenceLists = {};
        if(__APOGEE_ENVIRONMENT__ == "WEB") this.referenceLists[EsModuleEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(EsModuleEntry.REFERENCE_TYPE_INFO);
        if(__APOGEE_ENVIRONMENT__ == "NODE") this.referenceLists[NpmModuleEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(NpmModuleEntry.REFERENCE_TYPE_INFO);
        this.referenceLists[JsScriptEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(JsScriptEntry.REFERENCE_TYPE_INFO);
        this.referenceLists[CssEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(CssEntry.REFERENCE_TYPE_INFO);
    }

    getApp() {
        return this.app;
    }

    /** This returns the tree entry to display the reference entry for this reference manager. */
    getTreeEntry(createIfMissing) {
        if((createIfMissing)&&(!this.referencesTreeEntry)) {
            this.referencesTreeEntry = this.instantiateTreeEntry();
        }
        return this.referencesTreeEntry;
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

    /** This method adds a reference entry, from the structure returned from
     * the save call. It returns a promise that
     * resolves when the entry are loaded. 
     */
    addEntry(entryJson) {
        
        //check if these object exist - if so, don't add them
    
        var listStruct = this.referenceLists[entryJson.entryType];
        
        if(!listStruct) throw new Error("Entry type nopt found: " + entryJson.entryType);
        
        var referenceEntry = listStruct.typeInfo.createEntryFunction(this,entryJson);
        return referenceEntry.loadEntry();
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
        
        //add tree entry if applicable
        if(listStruct.treeEntry) {
            var treeEntry = referenceEntry.getTreeEntry(true);
            listStruct.treeEntry.addChild(treeEntry);
        }
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

    getListStruct(typeInfo) {
        var listStruct = {};
        listStruct.typeInfo = typeInfo;
        listStruct.listEntries = [];
        listStruct.treeEntry = null;
        listStruct.state = bannerConstants.BANNER_TYPE_NORMAL;
        return listStruct;
    }


    /** @private */
    instantiateTreeEntry() {
        var iconUrl = apogeeui.getResourcePath(ReferenceManager.REFERENCES_ICON_PATH);
        var treeEntry = new TreeEntry("References", iconUrl, null, null, false);
        
        //add child lists
        for(var childKey in this.referenceLists) {
            var childStruct = this.referenceLists[childKey];
            
            this.addListTreeEntry(treeEntry,childStruct);
        }
        
        //set the state on the banner entry
        treeEntry.setBannerState(this.state);
        
        return treeEntry;
    }

    addListTreeEntry(referenceTreeEntry,childStruct) {
        var typeInfo = childStruct.typeInfo;
        var iconUrl = apogeeui.getResourcePath(typeInfo.LIST_ICON_PATH);
        var menuItemCallback = () => this.getListMenuItems(typeInfo);
        var listTreeEntry = new TreeEntry(typeInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);
        
        //add existing child entries
        for(var childKey in childStruct.listEntries) {
            var childEntry = childStruct.listEntries[childKey];
            var treeEntry = childEntry.getTreeEntry(true);
            listTreeEntry.addChild(treeEntry);
        }
        
        //set the state on the banner entry
        listTreeEntry.setBannerState(childStruct.state);
        
        childStruct.treeEntry = listTreeEntry;
        referenceTreeEntry.addChild(listTreeEntry);
    }


    /** @private */
    getListMenuItems(typeInfo) {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = typeInfo.ADD_ENTRY_TEXT;
        itemInfo.callback = () => addLink(this,typeInfo);
        menuItemList.push(itemInfo);
        
        return menuItemList;
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

ReferenceManager.REFERENCES_ICON_PATH = "/componentIcons/references.png";