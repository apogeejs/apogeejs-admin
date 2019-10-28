/** This component represents a json table object. */
apogeeapp.app.ParentWebComponentDisplay = function(component, options) {
    this.component = component;
    this.member = component.getMember();
    
    if(!options) options = {};
    this.options = options;
   
    this.loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.ParentWindowComponentDisplay.destroy);
};


apogeeapp.app.ParentWebComponentDisplay.prototype.getDisplayFrame = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
apogeeapp.app.ParentWebComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
apogeeapp.app.ParentWebComponentDisplay.prototype.getPreferredState = function() {
    return apogeeapp.ui.WINDOW_STATE_MINIMIZED;
}



apogeeapp.app.ParentWebComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.app.ParentWebComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

apogeeapp.app.ParentWebComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowFrame) {
        var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.windowFrame.setIconOverlay(iconOverlay);
        }
        else {
            this.windowFrame.clearIconOverlay();
        }
    }
}

apogeeapp.app.ParentWebComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.member.getDisplayName());
    }
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.ParentWebComponentDisplay.prototype.getStateJson = function() {
    
    if(this.windowFrame) {
        var json = {};
        json.posInfo = this.windowFrame.getPosInfo();
        return json;
    }
    else return undefined;
}

//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.ParentWebComponentDisplay.prototype.loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = false;
    memberWindowOptions.maximizable = false;
    memberWindowOptions.resizable = false;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new apogeeapp.ui.WindowFrame(memberWindowOptions);
    this.windowFrame.setWindowState(apogeeapp.ui.WINDOW_STATE_MINIMIZED);

    //add zero size content
    var dummyDiv = apogeeapp.ui.createElement("div");
    this.windowFrame.setContent(dummyDiv,apogeeapp.ui.RESIZABLE);
    
    //set title
    this.windowFrame.setTitle(this.member.getDisplayName());
    
    // set menu
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());
    
    var instance = this;
    var createMenuItemsCallback = function() {
        var menuItemList = [];
        var openMenuItem = instance.component.getOpenMenuItem();
        if(openMenuItem) {
            menuItemList.push(openMenuItem);
        }
        return instance.component.getMenuItems(menuItemList);
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
apogeeapp.app.ParentWebComponentDisplay.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}
