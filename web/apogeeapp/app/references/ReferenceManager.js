
/** This class manages links and other reference entries.*/
apogeeapp.app.ReferenceManager = function() {
    
    this.referencesTreeEntry = null;
    this.state = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
    
    this.referenceLists = {};
    var jsInfo = apogeeapp.app.LinkEntry.JS_LINK_LIST_INFO;
    var cssInfo = apogeeapp.app.LinkEntry.CSS_LINK_LIST_INFO;
    this.referenceLists[jsInfo.typeName] = this.getListStruct(jsInfo);
    this.referenceLists[cssInfo.typeName] = this.getListStruct(cssInfo);
}

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
apogeeapp.app.ReferenceManager.prototype.openEntries = function(referencesJson) {

    var entryPromises = [];
    
    var loadEntry = entryJson => {
        var listStruct = this.referenceLists[entryJson.entryType];
        
        //load this url if it doesn't exist
        if(!listStruct.listEntries.some( listEntry => (listEntry.url == entryJson.url) )) {
            var referenceEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
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
    var referenceEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
    return referenceEntry.loadEntry();
}

/** This method should be called when the workspace is closed. It removes all links. 
 */
apogeeapp.app.ReferenceManager.prototype.close = function() {
    for(var listType in this.referenceLists) {
        var listStruct = this.referenceLists[listType];
        listStruct.listEntries.forEach( referenceEntry => referenceEntry.remove() );
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

apogeeapp.app.ReferenceManager.prototype.getListStruct = function(listInfo) {
    var listStruct = {};
    listStruct.listInfo = listInfo;
    listStruct.listEntries = [];
    listStruct.treeEntry = null;
    listStruct.state = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
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
    var listInfo = childStruct.listInfo;
    var iconUrl = apogeeapp.ui.getResourcePath(listInfo.listIconPath);
    var menuItemCallback = () => this.getListMenuItems(listInfo);
    var listTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry(listInfo.listName, iconUrl, null, menuItemCallback, false);
    
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
apogeeapp.app.ReferenceManager.prototype.getListMenuItems = function(listInfo) {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = listInfo.addEntryText;
    itemInfo.callback = () => listInfo.addEntry(this);
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
        
        if(listState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) hasError = true;
        else if(listState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) hasPending = true;
    }
        
    var newState;
    if(hasError) {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
    }
    else if(hasPending) {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
    }
    else {
        newState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
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
        if(state == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
            hasError = true;
        }
        else if(state == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
            hasPending = true;
        }
    }
        
    listStruct.listEntries.forEach(checkStatus);
        
    var listState;
    if(hasError) {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
    }
    else if(hasPending) {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
    }
    else {
        listState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NORMAL;
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
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
apogeeapp.app.ReferenceManager._createId = function() {
    return apogeeapp.app.ReferenceManager.nextId++;
}

/** @private */
apogeeapp.app.ReferenceManager.applyBannerState = function(treeEntry,state) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(state);
    if(iconOverlay) {
        treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        treeEntry.clearIconOverlay();
    }
}