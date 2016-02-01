/** This is a mixin that encapsulates the base functionality of a parent container for a control
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.visiui.ParentContainer = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.visiui.ParentContainer.init = function(containerElement, eventManager) {
    this.containerElement = containerElement;
    this.eventManager = eventManager;
    
    this.windowFrameStack = [];
    
    //child auto positioning variables
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}

visicomp.visiui.ParentContainer.BASE_ZINDEX = 0;

//constants for window placement
visicomp.visiui.ParentContainer.DELTA_CHILD_X = 75;
visicomp.visiui.ParentContainer.DELTA_CHILD_Y = 75;
visicomp.visiui.ParentContainer.MIN_WRAP_WIDTH = 20; 
visicomp.visiui.ParentContainer.MIN_WRAP_HEIGHT = 200;

//==============================
// Public Instance Methods
//==============================

/** This returns the dom element taht contains the child. */
visicomp.visiui.ParentContainer.getContainerElement = function() {
    return this.containerElement;
}

/** This gets the event manager associated with window evetns for the container, such as resize. */
visicomp.visiui.ParentContainer.getEventManager = function() {
    return this.eventManager;
}


/** This method adds a windows to the parent. It does not show the window. Show must be done. */
visicomp.visiui.ParentContainer.addWindow = function(windowFrame) {
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method removes the window from the parent container. */
visicomp.visiui.ParentContainer.removeWindow = function(windowFrame) {
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    this.updateOrder();
}

/** This brings the given window to the front inside this container. */
visicomp.visiui.ParentContainer.bringToFront = function(windowFrame) {
    //remove from array
    var index = this.windowFrameStack.indexOf(windowFrame);
    this.windowFrameStack.splice(index,1);
    //readd at the end
    this.windowFrameStack.push(windowFrame);
    this.updateOrder();
}

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
visicomp.visiui.ParentContainer.getCenterOnPagePosition = function(child) {
    var element = child.getElement();
    var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
    var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
    return [x,y];
}


/** This method returns the position of the next window for auto/cascade positioning. */
visicomp.visiui.ParentContainer.getNextWindowPosition = function() {
    var x = this.prevNewChildX + visicomp.visiui.ParentContainer.DELTA_CHILD_X;
    var y = this.prevNewChildY + visicomp.visiui.ParentContainer.DELTA_CHILD_Y;
    
    if( ((x > this.containerElement.offsetWidth)&&(x > visicomp.visiui.ParentContainer.MIN_WRAP_WIDTH)) && 
        ((y > this.containerElement.offsetHeight)&&(y > visicomp.visiui.ParentContainer.MIN_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = visicomp.visiui.ParentContainer.DELTA_CHILD_X * (this.wrapCount + 1);
        y = visicomp.visiui.ParentContainer.DELTA_CHILD_Y;
    }
    
    this.prevNewChildX = x;
    this.prevNewChildY = y;
    
    return [x,y];
}

//=========================
// Private Methods
//=========================

/** This updates the order for the windows.
 * @private */
visicomp.visiui.ParentContainer.updateOrder = function() {
    var zIndex = visicomp.visiui.ParentContainer.BASE_ZINDEX;
    for(var i = 0; i < this.windowFrameStack.length; i++) {
        var windowFrame = this.windowFrameStack[i];
        windowFrame.setZIndex(zIndex++);
    }
}