/** This component represents a json table object. */
haxapp.app.ParentWindowComponentDisplay = function(component, options) {
    this.component = component;
    this.object = component.getObject();
    
    this.options = options;
   
    this._loadWindowFrameEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(haxapp.app.ParentWindowComponentDisplay.destroy);
};


haxapp.app.ParentWindowComponentDisplay.prototype.getWindowEntry = function() {
    return this.windowFrame;
}

/** This returns the preferred size, to be used by the parent to set the window position.
 * The result may be undefined.
 * 
 * return {"x":x,"y":y}
 */
haxapp.app.ParentWindowComponentDisplay.prototype.getPreferredPosition = function() {
    if(this.options) {
        return this.options.posInfo;
    }
    else {
        return undefined;
    }
}

/** This returns the preferred state - minimized, maximized, normal */
haxapp.app.ParentWindowComponentDisplay.prototype.getPreferredState = function() {
    return haxapp.ui.WINDOW_STATE_MINIMIZED;
}



haxapp.app.ParentWindowComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

haxapp.app.ParentWindowComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.close();
    }
}

haxapp.app.ParentWindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    //banner not shown on parent window
}

haxapp.app.ParentWindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        //update the title
        this.windowFrame.setTitle(this.object.getDisplayName());
    }
}

/** This gets the current window state, to reconstruct the view. */
haxapp.app.ParentWindowComponentDisplay.prototype.getStateJson = function() {
    
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
haxapp.app.ParentWindowComponentDisplay.prototype._loadWindowFrameEntry = function() {
   
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = false;
    memberWindowOptions.maximizable = false;
    memberWindowOptions.resizable = false;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
    this.windowFrame.setWindowState(haxapp.ui.WINDOW_STATE_MINIMIZED);

    //add zero size content
    var dummyDiv = haxapp.ui.createElement("div");
    this.windowFrame.setContent(dummyDiv);
    
    //set title
    this.windowFrame.setTitle(this.object.getDisplayName());
    
    // set menu
    this._populateMenu();
}


//------------------------------------
// Menu Functions
//------------------------------------

haxapp.app.ParentWindowComponentDisplay.prototype._populateMenu = function() {
    var menu = this.windowFrame.createMenu(this.component.getIconUrl());

    //menu items
    var menuItemInfoList = [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this.component,this.object.generator);
    menuItemInfoList.push(itemInfo);

    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);

    //set the menu items
    menu.setMenuItems(menuItemInfoList);
}

//-----------------------------------
// Callbacks for management
//-----------------------------------

/** @protected */
haxapp.app.ParentWindowComponentDisplay.prototype.destroy = function() {
    for(var viewType in viewModeElements) {
        var viewModeElement = this.viewModeElemens[viewType];
        viewModeElement.destroy();
    }
}
