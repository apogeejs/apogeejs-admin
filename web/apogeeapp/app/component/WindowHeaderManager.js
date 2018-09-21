/** This is a class that manages banner messages for display classes. */
apogeeapp.app.WindowHeaderManager = function() {
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    this.headerContainer = document.createElement("div");
}

//=======================
// Headers
//=======================

//constants for the window banner bar
apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR = "error";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR = "red";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR = "white";
apogeeapp.app.WindowHeaderManager.ERROR_ICON_IMAGE = "/error.png";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING = "pending";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING = "black";
apogeeapp.app.WindowHeaderManager.PENDING_ICON_IMAGE = "/pending.png";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_INVALID = "invalid";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_INVALID = "gray";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_INVALID = "white";
apogeeapp.app.WindowHeaderManager.INVALID_ICON_IMAGE = "/invalid.png";

apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN = "black";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE = "none";

apogeeapp.app.WindowHeaderManager.PENDING_MESSAGE = "Calculation pending...";
apogeeapp.app.WindowHeaderManager.INVALID_MESSAGE = "Result not valid!";

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.showBannerBar = function(text,type) {
    
    if(!this.bannerDiv) {
        this.bannerDiv = apogeeapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":bgColor,
                "color":fgColor
            });
    }
    
    //get banner color
    var bgColor;
    var fgColor;
    if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_INVALID) {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_INVALID;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_INVALID;
    }
    else if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR;
    }
    else if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN;
        fgColor = apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN;
   }
   var colorStyle = {};
   colorStyle.backgroundColor = bgColor;
   colorStyle.color = fgColor;
   apogeeapp.ui.applyStyle(this.bannerDiv,colorStyle);
       
    //set message
    this.bannerDiv.innerHTML = text;
    this.bannerBarActive = true;
    
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideBannerBar = function() {
	this.bannerBarActive = false;
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
    this.updateHeaderElement();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
    this.updateHeaderElement();
}

/** This method shows the active headers. 
 * @private */
apogeeapp.app.WindowHeaderManager.prototype.updateHeaderElement = function() {
	var headerElements = [];
    if((this.toolbarActive)&&(this.toolbarDiv)) {
		headerElements.push(this.toolbarDiv);
	}
    if((this.saveBarActive)&&(this.saveDiv)) {
		headerElements.push(this.saveDiv);
	}
	if((this.bannerBarActive)&&(this.bannerDiv)) {
		headerElements.push(this.bannerDiv);
	}
    
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			this.headerContainer.appendChild(headerElements[i]);
		}
    }
}

//==============================
// Public Instance Methods
//==============================

/** This method returns the content element for the windowframe for this component. */
apogeeapp.app.WindowHeaderManager.prototype.getHeaderElement = function() {
     return this.headerContainer;
}

//===========================
// Static Methods
//===========================

apogeeapp.app.WindowHeaderManager.getIconOverlay = function(bannerState) {
    var resource;
    if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_INVALID) {
        resource = apogeeapp.app.WindowHeaderManager.INVALID_ICON_IMAGE;
    }
    else if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
        resource = apogeeapp.app.WindowHeaderManager.ERROR_ICON_IMAGE;
    }
    else if(bannerState == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
        resource = apogeeapp.app.WindowHeaderManager.PENDING_ICON_IMAGE;
    }
    
    if(!resource) return null;
    var url = apogeeapp.ui.getResourcePath(resource);
    var element = document.createElement("img");
    element.src = url;
    return element;
}