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

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING = "pending";
apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING = "black";

apogeeapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN = "yellow";
apogeeapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN = "black";

apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE = "none";

apogeeapp.app.WindowHeaderManager.PENDING_MESSAGE = "Calculation pending...";

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
    if(type == apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
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
// Protected Methods
//===========================

