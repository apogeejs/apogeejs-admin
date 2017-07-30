/** This object is a container for window frames. The argument of the constructor should
 * be an element that will hold the window frames.  */
apogeeapp.ui.WindowParent = function(containerElement) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    this.containerElement = containerElement;
    
    this.windowFrameStack = [];
    
    //child auto positioning variables
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.WindowParent,apogee.EventManager);

apogeeapp.ui.WindowParent.BASE_ZINDEX = 0;

//constants for window placement
apogeeapp.ui.WindowParent.DELTA_CHILD_X = 25;
apogeeapp.ui.WindowParent.DELTA_CHILD_Y = 25;
apogeeapp.ui.WindowParent.MAX_WRAP_WIDTH = 400; 
apogeeapp.ui.WindowParent.MAX_WRAP_HEIGHT = 400;

//==============================
// Public Instance Methods
//==============================

/** This should be called when the window parent element is shown, if the
 * "shown" event is to be supported.  */
apogeeapp.ui.WindowParent.prototype.elementIsShown = function() {
    this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
}

/** This should be called when the window parent element is shown, if the
 * "shown" event is to be supported.  */
apogeeapp.ui.WindowParent.prototype.elementIsHidden = function() {
    this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
}

apogeeapp.ui.WindowParent.prototype.getOuterElement = function() {
    return this.containerElement;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
apogeeapp.ui.WindowParent.prototype.addWindow = function(windowFrame) {
    this.containerElement.appendChild(windowFrame.getElement());
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
    
    windowFrame.setParent(this);
}

/** This method removes the window from the parent container. */
apogeeapp.ui.WindowParent.prototype.removeWindow = function(windowFrame) {
    this.containerElement.removeChild(windowFrame.getElement());
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

/** This brings the given window to the front inside this container. */
apogeeapp.ui.WindowParent.prototype.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
apogeeapp.ui.WindowParent.prototype.getCenterOnPagePosition = function(child) {
    var element = child.getElement();
    var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
    var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
    return [x,y];
}


/** This method returns the position of the next window for auto/cascade positioning. */
apogeeapp.ui.WindowParent.prototype.getNextWindowPosition = function() {
    var x = this.prevNewChildX + apogeeapp.ui.WindowParent.DELTA_CHILD_X;
    var y = this.prevNewChildY + apogeeapp.ui.WindowParent.DELTA_CHILD_Y;
    
    if( ((x > apogeeapp.ui.WindowParent.MAX_WRAP_WIDTH) || 
        (y > apogeeapp.ui.WindowParent.MAX_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = apogeeapp.ui.WindowParent.DELTA_CHILD_X * (this.wrapCount + 1);
        y = apogeeapp.ui.WindowParent.DELTA_CHILD_Y;
    }
    
    this.prevNewChildX = x;
    this.prevNewChildY = y;
    
    var pos = {};
    pos.x = x;
    pos.y = y;
    return pos;
}

//=========================
// Private Methods
//=========================

/** This updates the order for the windows.
 * @private */
apogeeapp.ui.WindowParent.prototype.updateOrder = function() {
    var zIndex = apogeeapp.ui.WindowParent.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
}