import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This object is a container for window frames. The argument of the constructor should
 * be an element that will hold the window frames.  */
export default class WindowParent extends EventManager {

    constructor(containerElement) {
        super();
        
        this.containerElement = containerElement;
        
        this.windowFrameStack = [];
        
        this.showing = false;
        
        //child auto positioning variables
        this.prevNewChildX = 0;
        this.prevNewChildY = 0;
        this.wrapCount = 0;
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This should be called when the window parent element is shown, if the
     * "shown" event is to be supported.  */
    elementIsShown() {
        this.showing = true;
        this.dispatchEvent(apogeeui.SHOWN_EVENT,this);
    }

    /** This should be called when the window parent element is shown, if the
     * "shown" event is to be supported.  */
    elementIsHidden() {
        this.showing = false;
        this.dispatchEvent(apogeeui.HIDDEN_EVENT,this);
    }

    /** This method returns true if this window parent is showing. */
    getIsShowing() {
        return this.showing;
    }

    getOuterElement() {
        return this.containerElement;
    }

    /** This method adds a windows to the parent. It does not show the window. Show must be done. */
    addWindow(windowFrame) {
        this.containerElement.appendChild(windowFrame.getElement());
        this.windowFrameStack.push(windowFrame);
        this.updateOrder();
        
        windowFrame.onAddedToParent(this);
    }

    /** This method removes the window from the parent container. */
    removeWindow(windowFrame) {
        this.containerElement.removeChild(windowFrame.getElement());
        var index = this.windowFrameStack.indexOf(windowFrame);
        this.windowFrameStack.splice(index,1);
        this.updateOrder();
    }

    /** This brings the given window to the front inside this container. */
    bringToFront(windowFrame) {
        //remove from array
        var index = this.windowFrameStack.indexOf(windowFrame);
        this.windowFrameStack.splice(index,1);
        //readd at the end
        this.windowFrameStack.push(windowFrame);
        this.updateOrder();
    }

    /** This method centers the dialog on the page. It must be called after the conten
     * is set, and possibly after it is rendered, so the size of it is calculated. */
    getCenterOnPagePosition(child) {
        var element = child.getElement();
        var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
        var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
        return [x,y];
    }


    /** This method returns the position of the next window for auto/cascade positioning. */
    getNextWindowPosition() {
        var x = this.prevNewChildX + WindowParent.DELTA_CHILD_X;
        var y = this.prevNewChildY + WindowParent.DELTA_CHILD_Y;
        
        if( ((x > WindowParent.MAX_WRAP_WIDTH) || 
            (y > WindowParent.MAX_WRAP_HEIGHT)) ) {
            this.wrapCount++;
            x = WindowParent.DELTA_CHILD_X * (this.wrapCount + 1);
            y = WindowParent.DELTA_CHILD_Y;
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
    updateOrder() {
        var zIndex = WindowParent.BASE_ZINDEX;
        for(var i = 0; i < this.windowFrameStack.length; i++) {
            var windowFrame = this.windowFrameStack[i];
            windowFrame.setZIndex(zIndex++);
        }
    }

}

WindowParent.BASE_ZINDEX = 0;

//constants for window placement
WindowParent.DELTA_CHILD_X = 25;
WindowParent.DELTA_CHILD_Y = 25;
WindowParent.MAX_WRAP_WIDTH = 400; 
WindowParent.MAX_WRAP_HEIGHT = 400;