
haxapp.ui.Tab = function(id, tabLabelElement, tabFrame) {
    
    //base init
    hax.EventManager.init.call(this);
    
    this.tabFrame = tabFrame;
    this.id = id;
    this.tabLabelElement= tabLabelElement;
    this.menuContainer = haxapp.ui.createElementWithClass("div","visiui-tf_tab-menuDiv",this.tabLabelElement);
    this.titleElement = haxapp.ui.createElementWithClass("div","visiui_tf_tab_title",this.tabLabelElement);
    
    this.closeButton = haxapp.ui.createElementWithClass("img","visiui_tf_tab_cmd_button",this.tabLabelElement);
    this.closeButton.src = haxapp.ui.getResourcePath(haxapp.ui.CLOSE_CMD_IMAGE);
    
    var instance = this;
    this.closeButton.onclick = function() {
        instance.close();
    };
    
    //attach to listeners to forward show and hide events
    this.tabShownListener = function(shownId) {
        if(shownId == id) {
            instance.dispatchEvent(haxapp.ui.TabFrame.TAB_SHOWN,this);
        }
    };
    this.tabFrame.addListener(haxapp.ui.TabFrame.TAB_SHOWN, this.tabShownListener);
    this.tabHiddenListener = function(hiddenId) {
        if(hiddenId == id) {
            instance.dispatchEvent(haxapp.ui.TabFrame.TAB_HIDDEN,this);
        }
    };
    this.tabFrame.addListener(haxapp.ui.TabFrame.TAB_HIDDEN, this.tabHiddenListener);
    
    //create the tab element
    this.displayFrame = haxapp.ui.createElementWithClass("div","visiui-tf-tab-window");
    
    this.isShowing = false;
}

//add components to this class
hax.base.mixin(haxapp.ui.Tab,hax.EventManager);

//---------------------------
// WINDOW CONTAINER
//---------------------------

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.setName = function(name) {
    this.titleElement.innerHTML = name;
    this.name = name;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getTitle = function() {
    return this.name;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.setTitle = function(name) {
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.setContent = function(contentElement) {
    haxapp.ui.removeAllChildren(this.displayFrame);
    this.displayFrame.appendChild(contentElement);
    this.content = contentElement;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getName = function() {
    return this.name;
}

/** This method shows the window. */
haxapp.ui.Tab.prototype.getMenu = function() {
    if(!this.menu) {
        this.menu = haxapp.ui.Menu.createMenuFromImage(haxapp.ui.getResourcePath(haxapp.ui.MENU_IMAGE));
		this.menuContainer.appendChild(this.menu.domElement);
    }
    return this.menu;
}

/** This method closes the window. */
haxapp.ui.Tab.prototype.close = function(forceClose) {
    if(!this.tabFrame) return;
    
    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(haxapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == haxapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }
    
    this.dispatchEvent(haxapp.ui.CLOSE_EVENT,this);
    
    this.tabFrame.removeListener(haxapp.ui.TabFrame.TAB_SHOWN, this.tabShownListener);
    this.tabFrame.removeListener(haxapp.ui.TabFrame.TAB_HIDDEN, this.tabHiddenListener);
    this.tabFrame.closeTab(this.id);
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getOuterElement = function() {
    return this.displayFrame;
}

