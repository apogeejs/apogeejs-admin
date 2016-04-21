
visicomp.visiui.Tab = function(name, tabFrame) {
    
    //create the tab element
    var element = document.createElement("div");

    //base init
    visicomp.core.EventManager.init.call(this);
    visicomp.visiui.ParentContainer.init.call(this,element,this);
	visicomp.visiui.ParentHighlighter.init.call(this,element);
    
    this.name = name;
    this.isShowing = false;
    
    visicomp.visiui.applyStyle(element,visicomp.visiui.Tab.TAB_WINDOW_STYLE);
	this.displayFrame = element;
    
    //add handlers for resize and show
    var instance = this;
    tabFrame.addListener(visicomp.visiui.TabFrame.TABS_RESIZED, function() {  
        instance.dispatchEvent(visicomp.visiui.WindowFrame.RESIZED,this);
    });
    tabFrame.addListener(visicomp.visiui.TabFrame.TAB_SHOWN, function(activeTabName) {
        if(activeTabName == instance.name) {
            instance.isShowing = true;
            instance.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_SHOWN,instance);
        }
        else {
            instance.isShowing = false;
            instance.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_HIDDEN,instance);
        }
    });
    
    
}

//add components to this class
visicomp.core.util.mixin(visicomp.visiui.Tab,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.visiui.Tab,visicomp.visiui.ParentContainer);
visicomp.core.util.mixin(visicomp.visiui.Tab,visicomp.visiui.ParentHighlighter);

visicomp.visiui.Tab.TAB_WINDOW_STYLE = {
    "top":"0px",
    "left":"0px",
	"height":"100%",
    "position":"relative",
    "backgroundColor":"white",
    "overflow":"auto"
}

/** This method must be implemented in inheriting objects. */
visicomp.visiui.Tab.prototype.getContentIsShowing = function() {
    return this.isShowing;
}