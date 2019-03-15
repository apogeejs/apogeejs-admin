
apogeeapp.ui.Tab = function(id) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    this.tabFrame = null;
    this.id = id;
    this.tabLabelElement = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-base visiui-tf-tab-inactive");
    
    this.menuContainer = apogeeapp.ui.createElementWithClass("div","visiui-tf_tab-menuDiv",this.tabLabelElement);
    this.titleElement = apogeeapp.ui.createElementWithClass("div","visiui_tf_tab_title",this.tabLabelElement);
    
    this.closeButton = apogeeapp.ui.createElementWithClass("img","visiui_tf_tab_cmd_button",this.tabLabelElement);
    this.closeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.CLOSE_CMD_IMAGE);
    
    var instance = this;
    this.closeButton.onclick = function() {
        instance.close();
    };
    
    //create the tab element
    this.displayFrame = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-window");
    this.tabInsideContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    this.displayFrame.appendChild(this.tabInsideContainer.getOuterElement());
    
    this.headerContainer = this.tabInsideContainer.getHeaderContainer();
    this.bodyContainer = this.tabInsideContainer.getBodyContainer();
    
    this.isShowing = false;
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.Tab,apogee.EventManager);

//---------------------------
// WINDOW CONTAINER
//---------------------------

/** This is called by the tab frame. */
apogeeapp.ui.Tab.prototype.setTabFrame = function(tabFrame) {
    this.tabFrame = tabFrame;
    var instance = this;
    //attach to listeners to forward show and hide events
    this.tabShownListener = function(tab) {
        if(tab == instance) {
            this.isShowing = true;
            instance.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,instance);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.SHOWN_EVENT, this.tabShownListener);
    this.tabHiddenListener = function(tab) {
        if(tab == instance) {
            this.isShowing = false;
            instance.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,instance);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.HIDDEN_EVENT, this.tabHiddenListener);
}

/** This sets the tab as the active tab. It returns true if it can do this. In the case
 * it does not have an active frame, it returns false. */
apogeeapp.ui.Tab.prototype.makeActive = function() {
    if(this.tabFrame) {
        this.tabFrame.setActiveTab(this.id);
        return true;
    }
    else {
        return false;
    }
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getId = function() {
    return this.id;
}

/** This returns true if the tab is showing in the display. */
apogeeapp.ui.Tab.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setTitle = function(title) {
    this.titleElement.innerHTML = title;
    this.title = title;
}

/** This sets the content for the window. If null (or otherwise false) is passed
 * the content will be set to empty.*/
apogeeapp.ui.Tab.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    if(contentElement) {
        this.headerContainer.appendChild(contentElement);
    }
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
 *  apogeeapp.ui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.*/
apogeeapp.ui.Tab.prototype.setContent = function(contentElement,elementType) {
    if(!this.contentContainer) {
        this.contentContainer = apogeeapp.ui.createElement("div");
        apogeeapp.ui.removeAllChildren(this.bodyContainer);
        this.bodyContainer.appendChild(this.contentContainer);
    }
    if(elementType == apogeeapp.ui.RESIZABLE) {
        this.contentContainer.className = "visiui_tf_tab_contents_fixed";
    }
    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
        this.contentContainer.className = "visiui_tf_tab_contents_scrolling";
    }
    else {
        throw new Error("Unknown content type: " + elementType);
    }
    
    apogeeapp.ui.removeAllChildren(this.contentContainer);
    this.contentContainer.appendChild(contentElement);
    
    this.content = contentElement;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getTitle = function() {
    return this.title;
}

/** This method shows the window. */
apogeeapp.ui.Tab.prototype.createMenu = function(iconUrl) {
    if(!iconUrl) iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.ui.MENU_IMAGE);
    this.menu = apogeeapp.ui.Menu.createMenuFromImage(iconUrl);
    this.menuContainer.appendChild(this.menu.domElement);
    //add the icon overlay element
    this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_tf_icon_overlay",this.menuContainer);
    return this.menu;
}

/** This method shows the window. */
apogeeapp.ui.Tab.prototype.getMenu = function() {
    return this.menu;
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.ui.Tab.prototype.setIconOverlay = function(element) {
    if(this.iconOverlayElement) {
        this.clearIconOverlay();
        if(element) {
            this.iconOverlayElement.appendChild(element);
        }
    }
}

apogeeapp.ui.Tab.prototype.clearIconOverlay = function() {
    if(this.iconOverlayElement) {
        apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
    }
}

/** This method closes the window. */
apogeeapp.ui.Tab.prototype.close = function(forceClose) {
    if(!this.tabFrame) return;
    
    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }
    
    this.tabFrame.closeTab(this.id);
    this.tabFrame.removeListener(apogeeapp.ui.SHOWN_EVENT, this.tabShownListener);
    this.tabFrame.removeListener(apogeeapp.ui.HIDDEN_EVENT, this.tabHiddenListener);
    this.tabFrame = null;
    
    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
    
    
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getMainElement = function() {
    return this.displayFrame;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getLabelElement = function() {
    return this.tabLabelElement;
}

