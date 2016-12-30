
haxapp.ui.Tab = function(name, tabFrame) {
    
    //create the tab element
    var element = haxapp.ui.createElementWithClass("div","visiui-tf-tab-window");

    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.ParentContainer.init.call(this,element,this);
	haxapp.ui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;

	this.displayFrame = element;
    
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
hax.base.mixin(haxapp.ui.Tab,haxapp.ui.ParentContainer);
hax.base.mixin(haxapp.ui.Tab,haxapp.ui.ParentHighlighter);

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}