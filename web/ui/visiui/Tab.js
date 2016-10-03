
hax.visiui.Tab = function(name, tabFrame) {
    
    //create the tab element
    var element = document.createElement("div");

    //base init
    hax.core.EventManager.init.call(this);
    hax.visiui.ParentContainer.init.call(this,element,this);
	hax.visiui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;
    
    hax.visiui.applyStyle(element,hax.visiui.Tab.TAB_WINDOW_STYLE);
	this.displayFrame = element;
    
    //add handlers for resize and show
    var instance = this;
    tabFrame.addListener(hax.visiui.TabFrame.TABS_RESIZED, function() {  
        instance.dispatchEvent(hax.visiui.WindowFrame.RESIZED,this);
    });
    tabFrame.addListener(hax.visiui.TabFrame.TAB_SHOWN, function(activeTabName) {
        if(activeTabName == instance.name) {
            instance.isShowing = true;
            instance.dispatchEvent(hax.visiui.ParentContainer.CONTENT_SHOWN,instance);
        }
        else {
            instance.isShowing = false;
            instance.dispatchEvent(hax.visiui.ParentContainer.CONTENT_HIDDEN,instance);
        }
    });
    
    
}

//add components to this class
hax.core.util.mixin(hax.visiui.Tab,hax.core.EventManager);
hax.core.util.mixin(hax.visiui.Tab,hax.visiui.ParentContainer);
hax.core.util.mixin(hax.visiui.Tab,hax.visiui.ParentHighlighter);

hax.visiui.Tab.TAB_WINDOW_STYLE = {
    "top":"0px",
    "left":"0px",
	"height":"100%",
    "position":"relative",
    "backgroundColor":"white",
    "overflow":"auto"
}

/** This method must be implemented in inheriting objects. */
hax.visiui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}