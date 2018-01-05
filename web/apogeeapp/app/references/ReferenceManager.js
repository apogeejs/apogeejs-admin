
/** This class manages links and other reference entries.*/
apogeeapp.app.ReferenceManager = function() {
    
    this.referencesTreeEntry = null;
    
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
        
        //make sure it doesn't exist?
        
        var referenceEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
        var promise = referenceEntry.loadEntry();
        entryPromises.push(promise);
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
    var treeEntry = referenceEntry.getTreeEntry();
    
    var listStruct = this.referenceLists[entryType];
    if(!listStruct) {
        throw new Error("Unrecognized link type: " + entryType);
    }
    
    listStruct.listEntries.push(referenceEntry);
    listStruct.listTreeEntry.addChild(treeEntry);
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.ReferenceManager.prototype.entryStatusChange = function(referenceEntry) {
    
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
    listStruct.listTreeEntry.removeChild(referenceEntry.getTreeEntry());
}

//=================================
// Private
//=================================

apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH = "/componentIcons/references.png";

apogeeapp.app.ReferenceManager.prototype.getListStruct = function(listInfo) {
    var listStruct = {};
    listStruct.listInfo = listInfo;
    listStruct.listEntries = [];
    //listStruct.listTreeEntry - add on creation
    return listStruct;
}


/** @private */
apogeeapp.app.ReferenceManager.prototype.instantiateTreeEntry = function() {
    var iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.ReferenceManager.REFERENCES_ICON_PATH);
    var treeEntry = new apogeeapp.ui.treecontrol.TreeEntry("References", iconUrl, null, null, false);
    
    //add child lists
    for(var childKey in this.referenceLists) {
        var childInfo = this.referenceLists[childKey];
        var iconUrl = apogeeapp.ui.getResourcePath(childInfo.listIconPath);
        var menuItemCallback = () => this.getListMenuItems(childInfo);
        var listTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry(childInfo.listName, iconUrl, null, menuItemCallback, false);
        treeEntry.addChild(listTreeEntry);
        
        childInfo.listTreeEntry = listTreeEntry;
    }
    
    return treeEntry;
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