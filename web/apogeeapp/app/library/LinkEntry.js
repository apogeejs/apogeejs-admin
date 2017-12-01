
/** This class manages links for the web page.*/
apogeeapp.app.LinkEntry = function(url,nickName,linkType) {
    this.url = url;
    if(!nickName) nickName = this.createLinkNameFromUrl(url);
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
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING,errorMsg);
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
                this.setBannerState(apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING,errorMsg);
                resolve(errorMsg);
            }
            
            //insert the link entry
            element = apogeeapp.ui.createElement(elementType,linkProps);
            document.head.appendChild(element);
        }
    }
    
    return new Promise(promiseFunction);
}

/** This method removes the link. */
apogeeapp.app.LinkEntry.prototype.remove = function() {
    var element = document.getElementById(this.url);
    if(element) {
        document.head.removeChild(element);
    }
}

//===================================
// private methods
//===================================

apogeeapp.app.LinkEntry.prototype.createLinkNameFromUrl = function(url) {
    return url;
}

apogeeapp.app.LinkEntry.prototype.getJsLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.url;
    linkProps.src = this.url;
    return linkProps;
}

apogeeapp.app.LinkEntry.prototype.getCssLinkProps = function() {
    var linkProps = {};
    linkProps.id = this.url;
    linkProps.rel = "stylesheet";
    linkProps.type = "text/css";
    linkProps.href = this.url;
    return linkProps;
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
    return new apogeeapp.ui.treecontrol.TreeEntry(this.nickName, iconUrl, null, null, false);
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
