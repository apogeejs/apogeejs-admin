/** This component represents a json table object. */
haxapp.app.WindowComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
   
    this._loadWindowFrameEntry();
    this.windowOpened = true;

};

haxapp.app.WindowComponentDisplay.prototype.getWindowEntry = function() {
    return this.windowFrame;
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
}

haxapp.app.WindowComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(this.windowHeaderManager) {
        if(bannerState == haxapp.app.DisplayContent.BANNER_TYPE_NONE) {
            this.windowHeaderManager.hideBannerBar();
        }
        else {
            this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
        }
    }
}

haxapp.app.WindowComponentDisplay.prototype.updateData = function() {
    if(this.windowFrame) {
        this.windowFrame.setTitle(this.object.getDisplayName());
        this.displayContent.memberUpdated();
    }
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.WindowComponentDisplay.prototype._loadWindowFrameEntry = function() {
    
    if(this.component.isParentComponent) {
        //window options
        var memberWindowOptions = {};
        memberWindowOptions.closeable = false;
        memberWindowOptions.movable = true;
        memberWindowOptions.resizable = true;
        memberWindowOptions.frameColorClass = "visicomp_windowColor";
        memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

        this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
        this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT); 
        
        this.displayContent = null;
    }
    else {
        //window options
        var memberWindowOptions = {};
        memberWindowOptions.closeable = false;
        memberWindowOptions.movable = true;
        memberWindowOptions.resizable = true;
        memberWindowOptions.frameColorClass = "visicomp_windowColor";
        memberWindowOptions.titleBarClass = "visicomp_titleBarClass";

        this.windowFrame = new haxapp.ui.WindowFrame(memberWindowOptions);
        this.windowFrame.setSize(this.component.generator.DEFAULT_WIDTH,this.component.generator.DEFAULT_HEIGHT);
        this.windowHeaderManager = new haxapp.app.WindowHeaderManager();
        
        this.displayContent = this.component.createDisplayContent(this.windowFrame);  
        
        this.windowFrame.setContent(this.windowHeaderManager.getOuterElement());
        this.windowHeaderManager.setContent(this.displayContent.getOuterElement())
    }
}
