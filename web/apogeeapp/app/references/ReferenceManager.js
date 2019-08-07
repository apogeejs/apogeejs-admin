import {addLink} from "/apogeeapp/app/commandseq/updatelinkseq.js";
import {bannerConstants,getIconOverlay} from "/apogeeapp/app/component/banner.js"; 

/** This class manages links and other reference entries, loading the references and
 * creating the UI tree elements for display of the references.
 * 
 * Any links needed for the page are managed externally by the Link Loader, which
 * allows multiple users to request the same link.
 */
apogeeapp.app.ReferenceManager = function() {
    
    this.referencesTreeEntry = null;
    this.state = bannerConstants.BANNER_TYPE_NORMAL;
    
    //references
    this.referenceLists = {};
    if(__APOGEE_ENVIRONMENT__ == "WEB") this.referenceLists[apogeeapp.app.AmdModuleEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(apogeeapp.app.AmdModuleEntry.REFERENCE_TYPE_INFO);
    if(__APOGEE_ENVIRONMENT__ == "NODE") this.referenceLists[apogeeapp.app.NpmModuleEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(apogeeapp.app.NpmModuleEntry.REFERENCE_TYPE_INFO);
    this.referenceLists[apogeeapp.app.JsScriptEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(apogeeapp.app.JsScriptEntry.REFERENCE_TYPE_INFO);
    this.referenceLists[apogeeapp.app.CssEntry.REFERENCE_TYPE_INFO.REFERENCE_TYPE] = this.getListStruct(apogeeapp.app.CssEntry.REFERENCE_TYPE_INFO);
}

/** This returns the tree entry to display the reference entry for this reference manager. */
apogeeapp.app.ReferenceManager.prototype.getTreeEntry = function(createIfMissing) {
    if((createIfMissing)&&(!this.referencesTreeEntry)) {
        this.referencesTreeEntry = this.instantiateTreeEntry();
    }
    return this.referencesTreeEntry;
}

/** This method opens the reference entries, from the structure returned from
 * the save call. It returns a promise that
 * resolves when all entries are loaded. 
 */
apogeeapp.app.ReferenceManager.prototype.getOpenEntriesPromise = function(referencesJson) {

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
apogeeapp.app.ReferenceManager.prototype.saveEntries = function() {
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
apogeeapp.app.ReferenceManager.prototype.addEntry = function(entryJson) {
    
    //check if these object exist - if so, don't add them
 
    var listStruct = this.referenceLists[entryJson.entryType];
    
    if(!listStruct) throw new Error("Entry type nopt found: " + entryJson.entryType);
    
    var referenceEntry = listStruct.typeInfo.createEntryFunction(this,entryJson);
    return referenceEntry.loadEntry();
}

/** This method should be called when the parent is closed. It removes all links. 
 */
apogeeapp.app.ReferenceManager.prototype.close = function() {
    for(var listType in this.referenceLists) {
        var listStruct = this.referenceLists[listType];
        listStruct.listEntries.forEach( referenceEntry => referenceEntry.remove() );
    }
}

apogeeapp.app.ReferenceManager.prototype.lookupEntry = function(entryType,url) {
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
apogeeapp.app.ReferenceManager.prototype.entryInserted = function(referenceEntry) {
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
apogeeapp.app.ReferenceManager.prototype.entryStatusChange = function(referenceEntry) {
    //just check all entries for find state
    this.processReferenceState();
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.ReferenceManager.prototype.entryRemoved= function(referenceEntry) {
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

apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH = "/componentIcons/references.png";

apogeeapp.app.ReferenceManager.prototype.getListStruct = function(typeInfo) {
    var listStruct = {};
    listStruct.typeInfo = typeInfo;
    listStruct.listEntries = [];
    listStruct.treeEntry = null;
    listStruct.state = bannerConstants.BANNER_TYPE_NORMAL;
    return listStruct;
}


/** @private */
apogeeapp.app.ReferenceManager.prototype.instantiateTreeEntry = function() {
    var iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH);
    var treeEntry = new apogeeapp.ui.treecontrol.TreeEntry("References", iconUrl, null, null, false);
    
    //add child lists
    for(var childKey in this.referenceLists) {
        var childStruct = this.referenceLists[childKey];
        
        this.addListTreeEntry(treeEntry,childStruct);
    }
    
    //set the state on the banner entry
    apogeeapp.app.ReferenceManager.applyBannerState(treeEntry,this.state);
    
    return treeEntry;
}

apogeeapp.app.ReferenceManager.prototype.addListTreeEntry = function(referenceTreeEntry,childStruct) {
    var typeInfo = childStruct.typeInfo;
    var iconUrl = apogeeapp.ui.getResourcePath(typeInfo.LIST_ICON_PATH);
    var menuItemCallback = () => this.getListMenuItems(typeInfo);
    var listTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry(typeInfo.LIST_NAME, iconUrl, null, menuItemCallback, false);
    
    //add existing child entries
    for(var childKey in childStruct.listEntries) {
        var childEntry = childStruct.listEntries[childKey];
        var treeEntry = childEntry.getTreeEntry(true);
        listTreeEntry.addChild(treeEntry);
    }
    
    //set the state on the banner entry
    apogeeapp.app.ReferenceManager.applyBannerState(listTreeEntry,childStruct.state);
    
    childStruct.treeEntry = listTreeEntry;
    referenceTreeEntry.addChild(listTreeEntry);
}


/** @private */
apogeeapp.app.ReferenceManager.prototype.getListMenuItems = function(typeInfo) {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = typeInfo.ADD_ENTRY_TEXT;
    itemInfo.callback = addLink(this,typeInfo);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @private */
apogeeapp.app.ReferenceManager.prototype.processReferenceState = function() {
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
        if(this.referencesTreeEntry) apogeeapp.app.ReferenceManager.applyBannerState(this.referencesTreeEntry,newState);
    }
}

/** This gets and applies the list state for a reference list. 
 * @private */
apogeeapp.app.ReferenceManager.prototype.getListState = function(listStruct) {
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
        if(listStruct.treeEntry) apogeeapp.app.ReferenceManager.applyBannerState(listStruct.treeEntry,listState);
    }
    
    return listState;
}

//=================================
// Static
//=================================

/** THis is used to give an id to the link entries 
 * @private */
apogeeapp.app.ReferenceManager.nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the application is opened. It is not persisted.
 * @private
 */
apogeeapp.app.ReferenceManager._createId = function() {
    return apogeeapp.app.ReferenceManager.nextId++;
}

/** @private */
apogeeapp.app.ReferenceManager.applyBannerState = function(treeEntry,state) {
    var iconOverlay = getIconOverlay(state);
    if(iconOverlay) {
        treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        treeEntry.clearIconOverlay();
    }
}