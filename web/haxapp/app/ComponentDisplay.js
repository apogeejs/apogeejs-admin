/** This is a component display. */
 
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.ComponentDisplay = function(window,component,generator,options) {
    
    if(!options) {
        options = {};
    }
    
    this.component = component;
    
    //------------------
    // populate window
    //------------------
    
    //set fixed pane for header container - will customize later
    this.windowInsideContainer = new haxapp.ui.HeaderContainer(haxapp.ui.DisplayAndHeader.FIXED_PANE);
    window.setContent(this.windowInsideContainer.getOuterElement());

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = window.getMenu();
    
    //------------------
    //set the title
    //------------------
    window.setTitle(this.getObject().getDisplayName());
    
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

//=======================
// Headers
//=======================

//constants for the window banner bar
haxapp.app.ComponentDisplay.BANNER_TYPE_ERROR = "error";
haxapp.app.ComponentDisplay.BANNER_BGCOLOR_ERROR = "red";
haxapp.app.ComponentDisplay.BANNER_FGCOLOR_ERROR = "white";

haxapp.app.ComponentDisplay.BANNER_TYPE_PENDING = "pending";
haxapp.app.ComponentDisplay.BANNER_BGCOLOR_PENDING = "yellow";
haxapp.app.ComponentDisplay.BANNER_FGCOLOR_PENDING = "black";

haxapp.app.ComponentDisplay.BANNER_BGCOLOR_UNKNOWN = "yellow";
haxapp.app.ComponentDisplay.BANNER_FGCOLOR_UNKNOWN = "black";

haxapp.app.ComponentDisplay.PENDING_MESSAGE = "Calculation pending...";

haxapp.app.ComponentDisplay.getTreeEntry = function() {
    return this.treeEntry;
}

/** This method returns the base member for this component. */
haxapp.app.ComponentDisplay.showBannerBar = function(text,type) {
    
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
    if(type == haxapp.app.ComponentDisplay.BANNER_TYPE_ERROR) {
        bgColor = haxapp.app.ComponentDisplay.BANNER_BGCOLOR_ERROR;
        fgColor = haxapp.app.ComponentDisplay.BANNER_FGCOLOR_ERROR;
    }
    else if(type == haxapp.app.ComponentDisplay.BANNER_TYPE_PENDING) {
        bgColor = haxapp.app.ComponentDisplay.BANNER_BGCOLOR_PENDING;
        fgColor = haxapp.app.ComponentDisplay.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = haxapp.app.ComponentDisplay.BANNER_BGCOLOR_UNKNOWN;
        fgColor = haxapp.app.ComponentDisplay.BANNER_FGCOLOR_UNKNOWN;
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
haxapp.app.ComponentDisplay.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.ComponentDisplay.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.ComponentDisplay.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.app.ComponentDisplay.showActiveHeaders = function() {
	var headers = [];
    if((this.toolbarActive)&&(this.toolbarDiv)) {
		headers.push(this.toolbarDiv);
	}
    if((this.saveBarActive)&&(this.saveDiv)) {
		headers.push(this.saveDiv);
	}
	if((this.bannerBarActive)&&(this.bannerDiv)) {
		headers.push(this.bannerDiv);
	}
	
    this.windowInsideContainer.loadHeaders(headers);
}

//==============================
// Public Instance Methods
//==============================


/** This method sets the content element as a scrolling element. */
haxapp.app.ComponentDisplay.setScrollingContentElement = function() {
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.SCROLLING_PANE);
}

/** This method sets the content element as a fixed element. */
haxapp.app.ComponentDisplay.setFixedContentElement = function() {
    //load the content div
    this.windowInsideContainer.setBodyType(haxapp.ui.DisplayAndHeader.FIXED_PANE);
}

/** This method returns the content element for the windowframe for this component. */
haxapp.app.ComponentDisplay.getContentElement = function() {
     return this.windowInsideContainer.getBodyElement();
}

//==============================
// Protected Instance Methods
//==============================

/** This method extends the member udpated function from the base.
 * @protected */    
haxapp.app.ComponentDisplay.memberUpdated = function() {
    //check for change of parent
    if(this.object.getParent() !== this.activeParent) {
        this.activeParent = this.object.getParent();
        this.parenContainer = this.getWorkspaceUI().getParentContainerObject(this.object);
        this.window.changeParent(this.parenContainer);
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
        
        this.showBannerBar(errorMsg,haxapp.app.ComponentDisplay.BANNER_TYPE_ERROR);
    }
    else if(object.getResultPending()) {
        this.showBannerBar(haxapp.app.ComponentDisplay.PENDING_MESSAGE,haxapp.app.ComponentDisplay.BANNER_TYPE_PENDING);
    }
    else {   
        this.hideBannerBar();
    }
}

/** This method makes sure the window title is up to date.
 * @private */    
haxapp.app.ComponentDisplay.updateTitle = function() {
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