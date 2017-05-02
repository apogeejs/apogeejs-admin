/** This is a class that manages banner messages for display classes. */
haxapp.app.WindowHeaderManager = function() {
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = null;
    this.body = null;
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    this.windowInsideContainer = new haxapp.ui.DisplayAndHeader(haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    
    this.body = this.windowInsideContainer.getBody();
      
}

//=======================
// Headers
//=======================

//constants for the window banner bar
haxapp.app.WindowHeaderManager.BANNER_TYPE_ERROR = "error";
haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR = "red";
haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR = "white";

haxapp.app.WindowHeaderManager.BANNER_TYPE_PENDING = "pending";
haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING = "yellow";
haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING = "black";

haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN = "yellow";
haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN = "black";

haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE = "none";

haxapp.app.WindowHeaderManager.PENDING_MESSAGE = "Calculation pending...";

/** This method returns the base member for this component. */
haxapp.app.WindowHeaderManager.prototype.showBannerBar = function(text,type) {
    
    if(!this.bannerDiv) {
        this.bannerDiv = haxapp.ui.createElement("div",null,
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
    if(type == haxapp.app.WindowHeaderManager.BANNER_TYPE_ERROR) {
        bgColor = haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_ERROR;
        fgColor = haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_ERROR;
    }
    else if(type == haxapp.app.WindowHeaderManager.BANNER_TYPE_PENDING) {
        bgColor = haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_PENDING;
        fgColor = haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = haxapp.app.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN;
        fgColor = haxapp.app.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN;
   }
   var colorStyle = {};
   colorStyle.backgroundColor = bgColor;
   colorStyle.color = fgColor;
   haxapp.ui.applyStyle(this.bannerDiv,colorStyle);
       
    //set message
    this.bannerDiv.innerHTML = text;
    this.bannerBarActive = true;
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.WindowHeaderManager.prototype.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.WindowHeaderManager.prototype.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.WindowHeaderManager.prototype.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.app.WindowHeaderManager.prototype.showActiveHeaders = function() {
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
    
    haxapp.ui.removeAllChildren(headerContainer);
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
haxapp.app.WindowHeaderManager.prototype.setScrollingContentElement = function() {
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.SCROLLING_PANE);
}

/** This method sets the content element as a fixed element. */
haxapp.app.WindowHeaderManager.prototype.setFixedContentElement = function() {
    //load the content div
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.FIXED_PANE);
}

/** This method returns the content element for the windowframe for this component. */
haxapp.app.WindowHeaderManager.prototype.getBody = function() {
     return this.body;
}

/** This method sets a content element in the body. Alternatively the body can 
 * be retrieved and loaded as desired. */
haxapp.app.WindowHeaderManager.prototype.setContent = function(element) {
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
haxapp.app.WindowHeaderManager.prototype.getOuterElement = function() {
     return this.windowInsideContainer.getOuterElement();
}



//===========================
// Protected Methods
//===========================

