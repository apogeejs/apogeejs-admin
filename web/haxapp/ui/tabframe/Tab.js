
haxapp.ui.Tab = function(name, tabFrame) {
    
    //create the tab element
    this.displayFrame = haxapp.ui.createElementWithClass("div","visiui-tf-tab-window");
    
    this.headerContainer = new haxapp.ui.DisplayAndHeader(haxapp.ui.DisplayAndHeader.FIXED_PANE,
                        null,
                        haxapp.ui.DisplayAndHeader.FIXED_PANE);
            
    this.displayFrame.appendChild(this.headerContainer.getOuterElement());
    
    this.titleBar = new haxapp.ui.TitleBar(this,haxapp.ui.CLOSEABLE);
    this.headerContainer.getHeader().appendChild(this.titleBar.getOuterElement());

    //base init
    hax.EventManager.init.call(this);
//    haxapp.ui.ParentContainer.init.call(this,element,this);
//	haxapp.ui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;
    
    //add handlers for resize and show
    var instance = this;
    tabFrame.addListener(haxapp.ui.TabFrame.TAB_SHOWN, function(activeTabName) {
        if(activeTabName == instance.name) {
            instance.isShowing = true;
            instance.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,instance);
        }
        else {
            instance.isShowing = false;
            instance.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,instance);
        }
    });
    
    
}

//add components to this class
hax.base.mixin(haxapp.ui.Tab,hax.EventManager);
//hax.base.mixin(haxapp.ui.Tab,haxapp.ui.ParentContainer);
//hax.base.mixin(haxapp.ui.Tab,haxapp.ui.ParentHighlighter);

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getOuterElement = function() {
    return this.displayFrame;
}

/** This method returns the window body.*/
haxapp.ui.Tab.prototype.getBody = function() {
    return this.headerContainer.getBody();
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