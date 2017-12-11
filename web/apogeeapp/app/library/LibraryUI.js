
/** This class manages links and other reference entries.*/
apogeeapp.app.LibraryUI = function() {
    this.createTreeEntry();
    
    this.libraryLists = {};
    var jsInfo = apogeeapp.app.LinkEntry.JS_LINK_LIST_INFO;
    var cssInfo = apogeeapp.app.LinkEntry.CSS_LINK_LIST_INFO;
    this.libraryLists[jsInfo.typeName] = this.getListStruct(jsInfo);
    this.libraryLists[cssInfo.typeName] = this.getListStruct(cssInfo);
}

apogeeapp.app.LibraryUI.prototype.getTreeEntry = function() {
    return this.libraryTreeEntry;
}

/** This method opens the reference entries, from the structure returned from
 * the save call. It returns a promise that
 * resolves when all entries are loaded. 
 */
apogeeapp.app.LibraryUI.prototype.openEntries = function(libraryJson) {

    var entryPromises = [];
    
    var loadEntry = entryJson => {
        var listStruct = this.libraryLists[entryJson.entryType];
        
        //make sure it doesn't exist?
        
        var libraryEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
        var promise = libraryEntry.loadEntry();
        entryPromises.push(promise);
    }
    libraryJson.forEach(loadEntry);
   
    return Promise.all(entryPromises);
}

/** This method opens the reference entries, from the structure returned from
 * the save call. It returns a promise that
 * resolves when all entries are loaded. 
 */
apogeeapp.app.LibraryUI.prototype.saveEntries = function() {
    var entryListJson = [];
    var saveEntry = listEntry => {
        var entryJson = listEntry.saveEntry();
        entryListJson.push(entryJson);
    }
    
    for(var listType in this.libraryLists) {
        var listStruct =  this.libraryLists[listType];
        listStruct.listEntries.forEach(saveEntry);
    }
   
    return entryListJson;
}

/** This method adds a reference entry, from the structure returned from
 * the save call. It returns a promise that
 * resolves when the entry are loaded. 
 */
apogeeapp.app.LibraryUI.prototype.addEntry = function(entryJson) {
    
    //check if these object exist - if so, don't add them
 
    var listStruct = this.libraryLists[entryJson.entryType];
    var libraryEntry = listStruct.listInfo.createEntryFunction(this,entryJson);
    return libraryEntry.loadEntry();
}

/** This method should be called when the workspace is closed. It removes all links. 
 */
apogeeapp.app.LibraryUI.prototype.close = function() {
    for(var listType in this.libraryLists) {
        var listStruct = this.libraryLists[listType];
        listStruct.listEntries.push( libraryEntry => libraryEntry.remove() );
    }
}

//================================
// Protected
//================================

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.LibraryUI.prototype.entryInserted = function(libraryEntry) {
    var entryType = libraryEntry.getEntryType();
    var treeEntry = libraryEntry.getTreeEntry();
    
    var listStruct = this.libraryLists[entryType];
    if(!listStruct) {
        throw new Error("Unrecognized link type: " + entryType);
    }
    
    listStruct.listEntries.push(libraryEntry);
    listStruct.listTreeEntry.addChild(treeEntry);
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.LibraryUI.prototype.entryStatusChange = function(libraryEntry) {
    
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.LibraryUI.prototype.entryRemoved= function(libraryEntry) {
    var entryType = libraryEntry.getEntryType();
    
    var listStruct = this.libraryLists[entryType];
    if(!listStruct) {
        throw new Error("Unrecognized link type: " + entryType);
    }
    
    listStruct.listEntries = listStruct.listEntries.filter( existingEntry => (existingEntry != libraryEntry) );
    listStruct.listTreeEntry.removeChild(libraryEntry.getTreeEntry());
}

//=================================
// Private
//=================================

apogeeapp.app.LibraryUI.LIBRARY_ICON_PATH = "/componentIcons/library.png";


/** @private */
apogeeapp.app.LibraryUI.prototype.createTreeEntry = function() {
    var iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.LIBRARY_ICON_PATH);
    this.libraryTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("Library", iconUrl, null, null, false);
}

apogeeapp.app.LibraryUI.prototype.getListStruct = function(listInfo) {
    
    //create the tree entry for this list
    var iconUrl = apogeeapp.ui.getResourcePath(listInfo.listIconPath);
    var menuItemCallback = () => this.getListMenuItems(listInfo);
    var listTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry(listInfo.listName, iconUrl, null, menuItemCallback, false);
    this.libraryTreeEntry.addChild(listTreeEntry);
    
    //create the list struct
    var listStruct = {};
    listStruct.listInfo = listInfo;
    listStruct.listEntries = [];
    listStruct.listTreeEntry = listTreeEntry;
 
    return listStruct;
}

/** @private */
apogeeapp.app.LibraryUI.prototype.getListMenuItems = function(listInfo) {
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
apogeeapp.app.LibraryUI.nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
apogeeapp.app.LibraryUI._createId = function() {
    return apogeeapp.app.LibraryUI.nextId++;
}