/** This component represents a json table object. */
haxapp.app.WindowComponentDisplay = function(component) {
    this.component = component;
    this.parentContainer = null;
    this.object = component.getObject();
   
    //change this logic
    if(!this.component.isParentComponent) {
        this._loadWindowFrameEntry();
        this.windowIconEntry = null;
        this.windowOpened = true;
    }
    else {
        this._loadWindowIconEntry();
        this.windowFrameEntry = null;
        this.windowOpened = false;
    }
};

haxapp.app.WindowComponentDisplay.prototype.getWindowEntry = function() {
    if(this.windowOpened) {
        return this.windowFrame;
    }
    else {
        return this.windowIcon;
    }
}

/** This returns true if the window is opened and false is the
 * icon is displayed. In either case the object is accessible using 
 * the getWindowEntry call. */ 
haxapp.app.WindowComponentDisplay.prototype.isOpened = function() {
    return this.windowOpened;
}

/** This returns the display content of the window. It will be null if the window
 * is closed and the icon is displayed. */ 
haxapp.app.WindowComponentDisplay.prototype.getDisplayContent = function() {
    return this.displayContent;
}

haxapp.app.WindowComponentDisplay.prototype.deleteDisplay = function() {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.deleteWindow();
    }
    if(this.windowIcon) {
        this.windowIcon.deleteWindow();
    }
}

haxapp.app.WindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.displayContent) {
        if(bannerState == haxapp.app.DisplayContent.BANNER_TYPE_NONE) {
            this.displayContent.hideBannerBar();
        }
        else {
            this.displayContent.showBannerBar(bannerMessage,bannerState);
        }
    }
}

haxapp.app.WindowComponentDisplay.prototype.updateData = function() {
    if(this.windowOpened) {
        this.windowFrame.setTitle(this.object.getTitle());
        this.displayContent.memberUpdated();
    }
    else {
        this.windowIcon.setTitle(this.object.getTitle());
    }
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.WindowComponentDisplay.prototype._loadWindowFrameEntry = function() {
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.closeable = true;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

    this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
    this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);
    this.displayContent = this.component.createDisplayContent(this.windowFrame);  
}

/** @private */
haxapp.app.WindowComponentDisplay.prototype._loadWindowIconEntry = function() {
    this.windowIcon = new haxapp.ui.WindowIcon();
    this.displayContent = null;
    
    //set title
    var child = this.component.getObject();
    this.windowIcon.setTitle(child.getName());
}
