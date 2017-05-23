/** This object is a container for window frames. The argument of the constructor should
 * be an element that will hold the window frames.  */
haxapp.ui.ParentContainer = function(containerElement) {
    
    this.containerElement = containerElement;
    
    this.windowFrameStack = [];
    
    //child auto positioning variables
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}


haxapp.ui.ParentContainer.BASE_ZINDEX = 0;

//constants for window placement
haxapp.ui.ParentContainer.DELTA_CHILD_X = 75;
haxapp.ui.ParentContainer.DELTA_CHILD_Y = 75;
haxapp.ui.ParentContainer.MIN_WRAP_WIDTH = 20; 
haxapp.ui.ParentContainer.MIN_WRAP_HEIGHT = 200;

//events
haxapp.ui.ParentContainer.CONTENT_SHOWN = "content shown";
haxapp.ui.ParentContainer.CONTENT_HIDDEN = "content hidden";

//==============================
// Public Instance Methods
//==============================

haxapp.ui.ParentContainer.prototype.getOuterElement = function() {
    return this.containerElement;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
haxapp.ui.ParentContainer.prototype.addWindow = function(windowFrame) {
    this.containerElement.appendChild(windowFrame.getElement());
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method removes the window from the parent container. */
haxapp.ui.ParentContainer.prototype.removeWindow = function(windowFrame) {
    this.containerElement.removeChild(windowFrame.getElement());
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

/** This brings the given window to the front inside this container. */
haxapp.ui.ParentContainer.prototype.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
haxapp.ui.ParentContainer.prototype.getCenterOnPagePosition = function(child) {
    var element = child.getElement();
    var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
    var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
    return [x,y];
}


/** This method returns the position of the next window for auto/cascade positioning. */
haxapp.ui.ParentContainer.prototype.getNextWindowPosition = function() {
    var x = this.prevNewChildX + haxapp.ui.ParentContainer.DELTA_CHILD_X;
    var y = this.prevNewChildY + haxapp.ui.ParentContainer.DELTA_CHILD_Y;
    
    if( ((x > this.containerElement.offsetWidth)&&(x > haxapp.ui.ParentContainer.MIN_WRAP_WIDTH)) && 
        ((y > this.containerElement.offsetHeight)&&(y > haxapp.ui.ParentContainer.MIN_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = haxapp.ui.ParentContainer.DELTA_CHILD_X * (this.wrapCount + 1);
        y = haxapp.ui.ParentContainer.DELTA_CHILD_Y;
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
haxapp.ui.ParentContainer.prototype.updateOrder = function() {
    var zIndex = haxapp.ui.ParentContainer.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
}