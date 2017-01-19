
haxapp.ui.Tab = function(id, tabLabelElement, tabFrame) {
    
    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.WindowHeaderManager.init.call(this);
    
    this.tabFrame = tabFrame;
    this.id = id;
    this.tabLabelElement= tabLabelElement;
    
    //create the tab element
    this.displayFrame = haxapp.ui.createElementWithClass("div","visiui-tf-tab-window");
    
    this.createHeaders(this.displayFrame);
    
    this.titleBar = new haxapp.ui.TitleBar(this,haxapp.ui.CLOSEABLE);
    this.showToolbar(this.titleBar.getOuterElement());
    
    this.isShowing = false;
}

//add components to this class
hax.base.mixin(haxapp.ui.Tab,hax.EventManager);
hax.base.mixin(haxapp.ui.Tab,haxapp.ui.WindowHeaderManager);

//---------------------------
// WINDOW CONTAINER
//---------------------------

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.setName = function(name) {
    this.tabLabelElement.innerHTML = name;
    this.name = name;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getName = function() {
    return this.name;
}


/** This method shows the window. */
haxapp.ui.Tab.prototype.getTitle = function() {
    return this.titleBar.getTitle();
}

/** This method shows the window. */
haxapp.ui.Tab.prototype.setTitle = function(title) {
    return this.titleBar.setTitle(title);
}

/** This method shows the window. */
haxapp.ui.Tab.prototype.getMenu = function() {
    return this.titleBar.getMenu();
}

/** This method closes the window. */
haxapp.ui.Tab.prototype.closeTab = function() {
    if(!this.tabFrame) return;
    
    this.tabFrame.removeListener(haxapp.ui.TabFrame.TAB_SHOWN, this.tabFrameListener);
    this.tabFrame.closeTab(this.id);
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getOuterElement = function() {
    return this.displayFrame;
}

