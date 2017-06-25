/** This is a class that manages banner messages for display classes. */
apogeeapp.app.WindowHeaderManager = function() {
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = null;
    this.body = null;
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    this.windowInsideContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    
    this.body = this.windowInsideContainer.getBody();
      
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
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
apogeeapp.app.WindowHeaderManager.prototype.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
apogeeapp.app.WindowHeaderManager.prototype.showActiveHeaders = function() {
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
	
    var headerContainer = this.windowInsideContainer.getHeader();
    
    apogeeapp.ui.removeAllChildren(headerContainer);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			headerContainer.appendChild(headerElements[i]);
		}
    }
}

//==============================
// Public Instance Methods
//==============================


/** This method sets the content element as a scrolling element. */
apogeeapp.app.WindowHeaderManager.prototype.setScrollingContentElement = function() {
    this.windowInsideContainer.setBodyType(apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE);
}

/** This method sets the content element as a fixed element. */
apogeeapp.app.WindowHeaderManager.prototype.setFixedContentElement = function() {
    //load the content div
    this.windowInsideContainer.setBodyType(apogeeapp.ui.DisplayAndHeader.FIXED_PANE);
}

/** This method returns the content element for the windowframe for this component. */
apogeeapp.app.WindowHeaderManager.prototype.getBody = function() {
     return this.body;
}

/** This method sets a content element in the body. Alternatively the body can 
 * be retrieved and loaded as desired. */
apogeeapp.app.WindowHeaderManager.prototype.setContent = function(element) {
    //remove the old content
    while(this.body.firstChild) {
        this.body.removeChild(this.body.firstChild);
    }
	
    //add the new content
    this.content = element;
    if(this.content) {
        this.body.appendChild(this.content);
    }
}


/** This method returns the fixed element which contains the body element. */
apogeeapp.app.WindowHeaderManager.prototype.getOuterElement = function() {
     return this.windowInsideContainer.getOuterElement();
}



//===========================
// Protected Methods
//===========================

