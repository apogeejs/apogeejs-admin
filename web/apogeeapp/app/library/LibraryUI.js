
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
        var linkEntry = new apogeeapp.app.LinkEntry(url,null,apogeeapp.app.LinkEntry.LINK_TYPE_JS);
        this.jsLinkEntries.push(linkEntry);
        var treeEntry = linkEntry.getTreeEntry();
        this.jsTreeEntry.addChild(url,treeEntry);
        var promise = linkEntry.loadLink();
        linkPromises.push(promise);
    }
    jsLinks.forEach(addJsLink);
    
    var addCssLink = url => {
        var linkEntry = new apogeeapp.app.LinkEntry(url,null,apogeeapp.app.LinkEntry.LINK_TYPE_CSS);
        this.cssLinkEntries.push(linkEntry);
        var treeEntry = linkEntry.getTreeEntry();
        this.cssTreeEntry.addChild(url,treeEntry);
        var promise = linkEntry.loadLink();
        linkPromises.push(promise);
    }
    cssLinks.forEach(addCssLink);
    
    return Promise.all(linkPromises);
}

/** This method should be called when the workspace is closed. It removes all links. 
 */
apogeeapp.app.LibraryUI.prototype.close = function() {
    this.jsLinkEnties.forEach( linkEntry => linkEntry.remove() );
    this.jsLinkEntries = [];
    
    this.cssLinkEntries.forEach( linkEntry => linkEntry.remove() );
    this.cssLinkEntries = [];
}

apogeeapp.app.LibraryUI.prototype.createTreeEntries = function() {
    var iconUrl;
    
    iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.LIBRARY_ICON_PATH);
    this.libraryTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("Library", iconUrl, null, null, false);
    
    iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.JS_LINKS_ICON_PATH);
    this.jsTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("JS Links", iconUrl, null, null, false);
    
    iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.app.LibraryUI.CSS_LINKS_ICON_PATH);
    this.cssTreeEntry = new apogeeapp.ui.treecontrol.TreeEntry("CSS Links", iconUrl, null, null, false);
    
    this.libraryTreeEntry.addChild("JS Links",this.jsTreeEntry);
    this.libraryTreeEntry.addChild("CSS Links",this.cssTreeEntry);
}
