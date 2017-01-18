/** This is a mixin to form the base for a component display, which is used
 * for different types of components and for both window and tab containers. */
haxapp.app.DisplayContent = {};
 
 
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.DisplayContent.init = function(component,container,options) {
    
    if(!options) {
        options = {};
    }
    
    this.component = component;
    this.options = options;
    
    //------------------
    // populate window
    //------------------
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = new haxapp.ui.DisplayAndHeader(haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            haxapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    container.getBody().appendChild(this.windowInsideContainer.getOuterElement());

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = container.getMenu();
    
    //------------------
    //set the title
    //------------------
    container.setTitle(component.getObject().getDisplayName());
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    //------------------
    // set menu
    //------------------
    
    //menu items
    var menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(component,this.generator);
    menuItemInfoList.push(itemInfo);
    
    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);
    
    //set the menu items
    menu.setMenuItems(menuItemInfoList);
      
}

/** This method returns the component object. */
haxapp.app.DisplayContent.getComponent = function() {
	return this.component;
}

/** This method returns the member object. */
haxapp.app.DisplayContent.getObject = function() {
	return this.component.getObject();
}

//=======================
// Headers
//=======================

//constants for the window banner bar
haxapp.app.DisplayContent.BANNER_TYPE_ERROR = "error";
haxapp.app.DisplayContent.BANNER_BGCOLOR_ERROR = "red";
haxapp.app.DisplayContent.BANNER_FGCOLOR_ERROR = "white";

haxapp.app.DisplayContent.BANNER_TYPE_PENDING = "pending";
haxapp.app.DisplayContent.BANNER_BGCOLOR_PENDING = "yellow";
haxapp.app.DisplayContent.BANNER_FGCOLOR_PENDING = "black";

haxapp.app.DisplayContent.BANNER_BGCOLOR_UNKNOWN = "yellow";
haxapp.app.DisplayContent.BANNER_FGCOLOR_UNKNOWN = "black";

haxapp.app.DisplayContent.BANNER_TYPE_NONE = "none";

haxapp.app.DisplayContent.PENDING_MESSAGE = "Calculation pending...";

/** This method returns the base member for this component. */
haxapp.app.DisplayContent.showBannerBar = function(text,type) {
    
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
    if(type == haxapp.app.DisplayContent.BANNER_TYPE_ERROR) {
        bgColor = haxapp.app.DisplayContent.BANNER_BGCOLOR_ERROR;
        fgColor = haxapp.app.DisplayContent.BANNER_FGCOLOR_ERROR;
    }
    else if(type == haxapp.app.DisplayContent.BANNER_TYPE_PENDING) {
        bgColor = haxapp.app.DisplayContent.BANNER_BGCOLOR_PENDING;
        fgColor = haxapp.app.DisplayContent.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = haxapp.app.DisplayContent.BANNER_BGCOLOR_UNKNOWN;
        fgColor = haxapp.app.DisplayContent.BANNER_FGCOLOR_UNKNOWN;
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
haxapp.app.DisplayContent.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.DisplayContent.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.DisplayContent.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.app.DisplayContent.showActiveHeaders = function() {
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
haxapp.app.DisplayContent.setScrollingContentElement = function() {
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.SCROLLING_PANE);
}

/** This method sets the content element as a fixed element. */
haxapp.app.DisplayContent.setFixedContentElement = function() {
    //load the content div
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.FIXED_PANE);
}

/** This method returns the content element for the windowframe for this component. */
haxapp.app.DisplayContent.getDisplayBodyElement = function() {
     return this.windowInsideContainer.getBody();
}

//==============================
// Protected Instance Methods
//==============================

/** This method extends the member udpated function from the base.
 * @protected */    
haxapp.app.DisplayContent.memberUpdated = function() {
    //check for change of parent
    if(this.object.getParent() !== this.activeParent) {
        this.activeParent = this.object.getParent();
        this.parenContainer = this.getWorkspaceUI().getParentContainerObject(this.object);
        this.window.setParent(this.parenContainer);
    }
    
    //update title
    this.updateTitle();
    
    //update data
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.showBannerBar(errorMsg,haxapp.app.DisplayContent.BANNER_TYPE_ERROR);
    }
    else if(object.getResultPending()) {
        this.showBannerBar(haxapp.app.DisplayContent.PENDING_MESSAGE,haxapp.app.DisplayContent.BANNER_TYPE_PENDING);
    }
    else {   
        this.hideBannerBar();
    }
}

/** This method makes sure the window title is up to date.
 * @private */    
haxapp.app.DisplayContent.updateTitle = function() {
    //make sure the title is up to date
    var member = this.getObject();
    
    var window = this.getWindow();
    if(window) {
        
        var displayName = member.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle !== displayName) {
            window.setTitle(displayName);
        }
    }
}