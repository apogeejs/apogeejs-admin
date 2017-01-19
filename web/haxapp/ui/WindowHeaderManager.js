/** This is a mixin to form the base for a component display, which is used
 * for different types of components and for both window and tab containers. */
haxapp.ui.WindowHeaderManager = {};
 
 
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.ui.WindowHeaderManager.init = function() {
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = null;
    this.body = null;
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
      
}

//=======================
// Headers
//=======================

//constants for the window banner bar
haxapp.ui.WindowHeaderManager.BANNER_TYPE_ERROR = "error";
haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_ERROR = "red";
haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_ERROR = "white";

haxapp.ui.WindowHeaderManager.BANNER_TYPE_PENDING = "pending";
haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_PENDING = "yellow";
haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_PENDING = "black";

haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN = "yellow";
haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN = "black";

haxapp.ui.WindowHeaderManager.BANNER_TYPE_NONE = "none";

haxapp.ui.WindowHeaderManager.PENDING_MESSAGE = "Calculation pending...";

/** This method returns the base member for this component. */
haxapp.ui.WindowHeaderManager.showBannerBar = function(text,type) {
    
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
    if(type == haxapp.ui.WindowHeaderManager.BANNER_TYPE_ERROR) {
        bgColor = haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_ERROR;
        fgColor = haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_ERROR;
    }
    else if(type == haxapp.ui.WindowHeaderManager.BANNER_TYPE_PENDING) {
        bgColor = haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_PENDING;
        fgColor = haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = haxapp.ui.WindowHeaderManager.BANNER_BGCOLOR_UNKNOWN;
        fgColor = haxapp.ui.WindowHeaderManager.BANNER_FGCOLOR_UNKNOWN;
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
haxapp.ui.WindowHeaderManager.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.ui.WindowHeaderManager.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.ui.WindowHeaderManager.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.ui.WindowHeaderManager.showActiveHeaders = function() {
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
haxapp.ui.WindowHeaderManager.setScrollingContentElement = function() {
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.SCROLLING_PANE);
}

/** This method sets the content element as a fixed element. */
haxapp.ui.WindowHeaderManager.setFixedContentElement = function() {
    //load the content div
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.FIXED_PANE);
}

/** This method returns the content element for the windowframe for this component. */
haxapp.ui.WindowHeaderManager.getBody = function() {
     return this.body;
}

/** This method sets a content element in the body. Alternatively the body can 
 * be retrieved and loaded as desired. */
haxapp.ui.WindowHeaderManager.setContent = function(element) {
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




//===========================
// Protected Methods
//===========================

/** This is the initializer for the component. The object passed is the core object
 * associated with this component. 
 * @protected */
haxapp.ui.WindowHeaderManager.createHeaders = function(containerBodyElement) {
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = new haxapp.ui.DisplayAndHeader(haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    containerBodyElement.appendChild(this.windowInsideContainer.getOuterElement());
    
    this.body = this.windowInsideContainer.getBody();
    
}

/** This method returns the fixed element which contains the body element. */
haxapp.ui.WindowHeaderManager.getBodyContainer = function() {
     return this.windowInsideContainer.getBodyContainer();
}

