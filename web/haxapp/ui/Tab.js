
haxapp.ui.Tab = function(name, tabFrame) {
    
    //create the tab element
    var element = document.createElement("div");

    //base init
    hax.EventManager.init.call(this);
    haxapp.ui.ParentContainer.init.call(this,element,this);
	haxapp.ui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;
    
    haxapp.ui.applyStyle(element,haxapp.ui.Tab.TAB_WINDOW_STYLE);
	this.displayFrame = element;
    
    //add handlers for resize and show
    var instance = this;
    tabFrame.addListener(haxapp.ui.TabFrame.TABS_RESIZED, function() {  
        instance.dispatchEvent(haxapp.ui.WindowFrame.RESIZED,this);
    });
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
hax.util.mixin(haxapp.ui.Tab,hax.EventManager);
hax.util.mixin(haxapp.ui.Tab,haxapp.ui.ParentContainer);
hax.util.mixin(haxapp.ui.Tab,haxapp.ui.ParentHighlighter);

haxapp.ui.Tab.TAB_WINDOW_STYLE = {
    "top":"0px",
    "left":"0px",
	"height":"100%",
    "position":"relative",
    "backgroundColor":"white",
    "overflow":"auto"
}

/** This method must be implemented in inheriting objects. */
haxapp.ui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}