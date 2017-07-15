
apogeeapp.ui.Tab = function(id, tabLabelElement, tabFrame) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    this.tabFrame = tabFrame;
    this.id = id;
    this.tabLabelElement= tabLabelElement;
    this.menuContainer = apogeeapp.ui.createElementWithClass("div","visiui-tf_tab-menuDiv",this.tabLabelElement);
    this.titleElement = apogeeapp.ui.createElementWithClass("div","visiui_tf_tab_title",this.tabLabelElement);
    
    this.closeButton = apogeeapp.ui.createElementWithClass("img","visiui_tf_tab_cmd_button",this.tabLabelElement);
    this.closeButton.src = apogeeapp.ui.getResourcePath(apogeeapp.ui.CLOSE_CMD_IMAGE);
    
    var instance = this;
    this.closeButton.onclick = function() {
        instance.close();
    };
    
    //attach to listeners to forward show and hide events
    this.tabShownListener = function(shownId) {
        if(shownId == id) {
            instance.dispatchEvent(apogeeapp.ui.TabFrame.TAB_SHOWN,this);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.TabFrame.TAB_SHOWN, this.tabShownListener);
    this.tabHiddenListener = function(hiddenId) {
        if(hiddenId == id) {
            instance.dispatchEvent(apogeeapp.ui.TabFrame.TAB_HIDDEN,this);
        }
    };
    this.tabFrame.addListener(apogeeapp.ui.TabFrame.TAB_HIDDEN, this.tabHiddenListener);
    
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
apogeeapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setName = function(name) {
    this.titleElement.innerHTML = name;
    this.name = name;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.getTitle = function() {
    return this.name;
}

/** This method must be implemented in inheriting objects. */
apogeeapp.ui.Tab.prototype.setTitle = function(name) {
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
    return this.menu;
}

/** This method shows the window. */
apogeeapp.ui.Tab.prototype.getMenu = function() {
    return this.menu;
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

