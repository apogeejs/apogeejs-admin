
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

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setTabFrame = function(tabFrame) {
    this.tabFrame = tabFrame;
    var instance = this;
    //attach to listeners to forward show and hide events
    this.tabShownListener = function(shownId) {
        if(shownId == instance.id) {
            instance.dispatchEvent(apogeeapp.ui.TabFrame.TAB_SHOWN,this);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.TabFrame.TAB_SHOWN, this.tabShownListener);
    this.tabHiddenListener = function(hiddenId) {
        if(hiddenId == instance.id) {
            instance.dispatchEvent(apogeeapp.ui.TabFrame.TAB_HIDDEN,this);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.TabFrame.TAB_HIDDEN, this.tabHiddenListener);
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
apogeeapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getId = function() {
    return this.id;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setName = function(name) {
    this.titleElement.innerHTML = name;
    this.name = name;
}

/** This sets the content for the window */
apogeeapp.ui.Tab.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    this.headerContainer.appendChild(contentElement);
    this.headerContent = contentElement;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.bodyContainer);
    this.bodyContainer.appendChild(contentElement);
    this.content = contentElement;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getName = function() {
    return this.name;
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
    
    this.tabFrame.removeListener(apogeeapp.ui.TabFrame.TAB_SHOWN, this.tabShownListener);
    this.tabFrame.removeListener(apogeeapp.ui.TabFrame.TAB_HIDDEN, this.tabHiddenListener);
    this.tabFrame.closeTab(this.id);
    this.tabFrame = null;
    
    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
    
    
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getOuterElement = function() {
    return this.displayFrame;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getLabelElement = function() {
    return this.tabLabelElement;
}

