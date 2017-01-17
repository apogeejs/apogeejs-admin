/** This component represents a json table object. */
haxapp.app.WindowComponentDisplay = function(component,parentContainer) {
    this.component = component;
    this.parentContainer = parentContainer;
    this.object = component.getObject();
    
    this.windowOpened = true;
   
    //change this logic
    if(!object.isParent) {
        this._loadWindowFrameEntry();
        this.windowIconEntry = null;
    }
    else {
        this._loadWindowIconEntry();
        this.windowFrameEntry = null;
    }
};

haxapp.app.WindowComponentDisplay.prototype.getWindowEntry = function() {
    return this.windowFrame;
}

haxapp.app.WindowComponentDisplay.prototype.getIconEntry = function() {
    return this.windowIcon;
}

haxapp.app.WindowComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    //window will get deleted! New parent will get new windows, as is appropriate
    if(this.windowFrame) {
        this.windowFrame.deleteWindow();
    }
    if(this.windowIcon) {
        this.windowIcon.deleteWindow();
    }
}

haxapp.app.WindowComponentDisplay.prototype.setBannerState = function() {
    
}

haxapp.app.WindowComponentDisplay.prototype.updateData = function() {
    
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
    this.displayObject = this.component.createWindowDisplay(this.windowFrame);

    
    //init-----------------------------
    this.parentContainer.setParent(parentContainer);
    var pos = thia.parentContainer.getNextWindowPosition();
    this.windowFrame.setPosition(pos[0],pos[1]);
    this.windowFrame.show();
    //---------------------------------------
    
}

/** @private */
haxapp.app.WindowComponentDisplay.prototype._loadWindowIconEntry = function() {
    this.windowIcon = new haxapp.ui.WindowIcon(this);
    this.displayObject = null;
    
    //set title
    var child = this.component.getObject();
    this.windowIcon.setTitle(child.getName());
    
    //init--------------------------------- 
    this.parentContainer.setParent(parentContainer);
    var pos = this.getNextWindowPosition();
    this.windowIcon.setPosition(pos[0],pos[1]);
    this.windowIcon.show();
    //---------------------------------------------
}
