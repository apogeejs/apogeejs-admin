
/** This class manages links and other reference entries.*/
apogeeapp.app.LibraryUI = function() {
    this.jsLinkEntries = [];
    this.cssLinkEntries = [];
    this.createTreeEntries();
}

apogeeapp.app.LibraryUI.LIBRARY_ICON_PATH = "/genericIcon.png";
apogeeapp.app.LibraryUI.JS_LINKS_ICON_PATH = "/genericIcon.png";
apogeeapp.app.LibraryUI.CSS_LINKS_ICON_PATH = "/genericIcon.png";

apogeeapp.app.LibraryUI.prototype.getTreeEntry = function() {
    return this.libraryTreeEntry;
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 */
apogeeapp.app.LibraryUI.prototype.openLinks = function(jsLinks,cssLinks) {
    
    var linkPromises = [];
    
    var addJsLink = url => {
        var linkEntry = new apogeeapp.app.LinkEntry(this,url,null,apogeeapp.app.LinkEntry.LINK_TYPE_JS);
        this.jsLinkEntries.push(linkEntry);
        var treeEntry = linkEntry.getTreeEntry();
        this.jsTreeEntry.addChild(linkEntry.getId(),treeEntry);
        var promise = linkEntry.loadLink();
        linkPromises.push(promise);
    }
    jsLinks.forEach(addJsLink);
    
    var addCssLink = url => {
        var linkEntry = new apogeeapp.app.LinkEntry(this,url,null,apogeeapp.app.LinkEntry.LINK_TYPE_CSS);
        this.cssLinkEntries.push(linkEntry);
        var treeEntry = linkEntry.getTreeEntry();
        this.cssTreeEntry.addChild(linkEntry.getId(),treeEntry);
        var promise = linkEntry.loadLink();
        linkPromises.push(promise);
    }
    cssLinks.forEach(addCssLink);
    
    return Promise.all(linkPromises);
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 */
apogeeapp.app.LibraryUI.prototype.addLink = function(url,nickName,linkType) {
    
    var linkEntry = new apogeeapp.app.LinkEntry(this,url,nickName,linkType);
    var treeEntry = linkEntry.getTreeEntry();
    
    //check if link already exists
    
    if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        this.jsLinkEntries.push(linkEntry);
        this.jsTreeEntry.addChild(linkEntry.getId(),treeEntry);
    }
    else if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS){
        this.cssLinkEntries.push(linkEntry);
        this.cssTreeEntry.addChild(linkEntry.getId(),treeEntry);
    }
    else {
        throw new Error("Unrecognized link type: " + linkType);
    }
    
    return linkEntry.loadLink();
}

/** This method should be called when the workspace is closed. It removes all links. 
 */
apogeeapp.app.LibraryUI.prototype.close = function() {
    this.jsLinkEnties.forEach( linkEntry => linkEntry.remove() );
    this.jsLinkEntries = [];
    
    this.cssLinkEntries.forEach( linkEntry => linkEntry.remove() );
    this.cssLinkEntries = [];
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.LibraryUI.prototype.linkReinserted = function(linkEntry,promise) {
    var linkType = linkEntry.getLinkType();
    var treeEntry = linkEntry.getTreeEntry();
    
    if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        this.jsLinkEntries.push(linkEntry);
        this.jsTreeEntry.addChild(linkEntry.getId(),treeEntry);
    }
    else if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS){
        this.cssLinkEntries.push(linkEntry);
        this.cssTreeEntry.addChild(linkEntry.getId(),treeEntry);
    }
    else {
        throw new Error("Unrecognized link type: " + linkType);
    }
}

/** This method opens a list of js and css links. It returns a promise that
 * resolves when all links are loaded. 
 * @protected */
apogeeapp.app.LibraryUI.prototype.linkRemoved= function(linkEntry) {
    var linkType = linkEntry.getLinkType();
    if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        this.jsLinkEntries = this.jsLinkEntries.filter( existingEntry => (existingEntry != linkEntry) );
        this.jsTreeEntry.removeChild(linkEntry.getId());
    }
    else if(linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS){
        this.cssLinkEntries = this.cssLinkEntries.filter( existingEntry => (existingEntry != linkEntry) );
        this.cssTreeEntry.removeChild(linkEntry.getId());
    }
    else {
        throw new Error("Unrecognized link type: " + linkType);
    }
}



/** @private */
apogeeapp.app.LibraryUI.prototype.createTreeEntries = function() {
    var iconUrl;
    
    var iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.LIBRARY_ICON_PATH);
    this.libraryTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("Library", iconUrl, null, null, false);
    
    var jsIconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.JS_LINKS_ICON_PATH);
    var jsMenuItemCallback = () => this.getMenuItems(apogeeapp.app.LinkEntry.LINK_TYPE_JS);
    this.jsTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("JS Links", jsIconUrl, null, jsMenuItemCallback, false);
    
    var cssIconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.CSS_LINKS_ICON_PATH);
    var cssMenuItemCallback = () => this.getMenuItems(apogeeapp.app.LinkEntry.LINK_TYPE_CSS);
    this.cssTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("CSS Links", cssIconUrl, null, cssMenuItemCallback, false);
    
    this.libraryTreeEntry.addChild("JS Links",this.jsTreeEntry);
    this.libraryTreeEntry.addChild("CSS Links",this.cssTreeEntry);
}

/** @private */
apogeeapp.app.LibraryUI.prototype.getMenuItems = function(linkType) {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Add Link";
    itemInfo.callback = apogeeapp.app.updatelink.getAddLinkCallback(this,linkType);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}
