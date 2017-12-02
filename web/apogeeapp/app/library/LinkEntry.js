
/** This class manages links for the web page.*/
apogeeapp.app.LinkEntry = function(libraryUI,url,nickName,linkType) {
    this.id = apogeeapp.app.LinkEntry._createId();
    this.libraryUI = libraryUI;
    this.url = url;
    if((!nickName)||(nickName.length === 0)) nickName = this.createLinkNameFromUrl(url);
    this.nickName = nickName;
    this.linkType = linkType;
    this.treeEntry = this.createTreeEntry();
}

apogeeapp.app.LinkEntry.LINK_TYPE_JS = "js link";
apogeeapp.app.LinkEntry.LINK_TYPE_CSS = "css link";

apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE = "script";
apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE = "link";

apogeeapp.app.LinkEntry.JS_ICON_RES_PATH = "/genericIcon.png";
apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH = "/genericIcon.png";


/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.LinkEntry.prototype.getId = function() {
    return this.id;
}

apogeeapp.app.LinkEntry.prototype.getUrl = function() {
    return this.url;
}

apogeeapp.app.LinkEntry.prototype.getNickName = function() {
    return this.nickName;
}

apogeeapp.app.LinkEntry.prototype.getLinkType = function() {
    return this.linkType;
}

/** This method loads the link onto the page. It returns a promise that
 * resolves when the link is loaded. */
apogeeapp.app.LinkEntry.prototype.loadLink = function() {
    
    var promiseFunction = (resolve,reject) => {
        //make sure this link does not already exist
        var element = document.getElementById(this.url);
        if(element) {
            var errorMsg = "The link already exists: " + this.url;
            this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING,errorMsg);
            reject(errorMsg);
            return;
        }
        else {
            var linkProps;
            var elementType;
            
            //create link properties
            if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
                linkProps = this.getJsLinkProps();
                elementType = apogeeapp.app.LinkEntry.JS_ELEMENT_TYPE;
            }
            else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
                linkProps = this.getCssLinkProps();
                elementType = apogeeapp.app.LinkEntry.CSS_ELEMENT_TYPE;
            }
            else {
                var errorMsg = "Unknown link type " + this.linkType;
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
                reject(errorMsg);
                return;
            }
            
            //add event handlers
            linkProps.onload = () => {
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE);
                resolve(this.url);
            }
            linkProps.onerror = (msg) => {
                var errorMsg = "Error loading link " + this.url + ": " + msg;
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR,errorMsg);
                reject(errorMsg);
            }
            
            //insert the link entry
            element = apogeeapp.ui.createElement(elementType,linkProps);
            document.head.appendChild(element);
        }
    }
    
    return new Promise(promiseFunction);
}

/** This method removes and reloads the link, returning a promise. */
apogeeapp.app.LinkEntry.prototype.updateData = function(url,nickName) {
    this.url = url;
    if((!nickName)||(nickName.length === 0)) nickName = this.createLinkNameFromUrl(url);
    this.nickName = nickName;
    
    //reload
    this.remove();
    var promise = this.loadLink();
    
    this.treeEntry.setLabel(this.nickName);
    
    this.libraryUI.linkReinserted(this,promise);
}

/** This method removes the link. */
apogeeapp.app.LinkEntry.prototype.remove = function() {
    var element = document.getElementById(this.getElementId());
    if(element) {
        document.head.removeChild(element);
    }
    
    this.libraryUI.linkRemoved(this);
}

//===================================
// private methods
//===================================

apogeeapp.app.LinkEntry.prototype.createLinkNameFromUrl = function(url) {
    return url;
}

apogeeapp.app.LinkEntry.prototype.getJsLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.src = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.prototype.getCssLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.getElementId();
    linkProps.rel = "stylesheet";
    linkProps.type = "text/css";
    linkProps.href = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.ELEMENT_ID_BASE = "__apogee_link_element_";
apogeeapp.app.LinkEntry.prototype.getElementId = function() {
    return apogeeapp.app.LinkEntry.ELEMENT_ID_BASE + this.id;
}

apogeeapp.app.LinkEntry.prototype.setBannerState = function(bannerState,bannerMessage) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
    if(iconOverlay) {
        this.treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        this.treeEntry.clearIconOverlay();
    }
}

apogeeapp.app.LinkEntry.prototype.createTreeEntry = function() {
    var iconUrl = this.getIconUrl();
    var menuItemsCallback = () => this.getMenuItems();
    return new apogeeapp.ui.treecontrol.TreeEntry(this.nickName, iconUrl, null, menuItemsCallback, false);
}

/** This method returns the icon url for the component. */
apogeeapp.app.LinkEntry.prototype.getIconUrl = function() {
    var resPath;
    
    if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_JS) {
        resPath = apogeeapp.app.LinkEntry.JS_ICON_RES_PATH;
    }
    else if(this.linkType == apogeeapp.app.LinkEntry.LINK_TYPE_CSS) {
        resPath = apogeeapp.app.LinkEntry.CSS_ICON_RES_PATH;
    }
    else {
        resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
    }
  
    return apogeeapp.ui.getResourcePath(resPath);
}

apogeeapp.app.LinkEntry.prototype.getMenuItems = function() {
    //menu items
    var menuItemList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Update Link";
    itemInfo.callback = apogeeapp.app.updatelink.getUpdateLinkCallback(this);
    menuItemList.push(itemInfo);
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Remove Link";
    itemInfo.callback = apogeeapp.app.updatelink.getRemoveLinkCallback(this);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

/** THis is used to give an id to the link entries 
 * @private */
apogeeapp.app.LinkEntry.nextId = 1;

/** This method generates a member ID for the member. It is only valid
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
apogeeapp.app.LinkEntry._createId = function() {
    return apogeeapp.app.LinkEntry.nextId++;
}

