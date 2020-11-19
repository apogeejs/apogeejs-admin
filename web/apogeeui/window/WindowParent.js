/** This object is a container for window frames. The argument of the constructor should
 * be an element that will hold the window frames.  */
export default class WindowParent {

    constructor(containerElement) {       
        this.containerElement = containerElement;
        this.windowFrameStack = [];
        this.onResizeListener = () => this._onResize()
        window.addEventListener("resize",this.onResizeListener);
    }

    //==============================
    // Public Instance Methods
    //==============================

    close() {
        window.removeEventListener("resize",this.onResizeListener);
    }

    getOuterElement() {
        return this.containerElement;
    }

    /** This method adds a windows to the parent. It does not show the window. Show must be done. */
    addWindow(windowFrame) {
        this.containerElement.appendChild(windowFrame.getElement());
        this.windowFrameStack.push(windowFrame);
        windowFrame.onAddedToParent(this);
    }

    /** This method removes the window from the parent container. */
    removeWindow(windowFrame) {
        this.containerElement.removeChild(windowFrame.getElement());
        var index = this.windowFrameStack.indexOf(windowFrame);
        this.windowFrameStack.splice(index,1);
    }

    /** This method centers the dialog on the page. It must be called after the conten
     * is set, and possibly after it is rendered, so the size of it is calculated. */
    getCenterOnPagePosition(child) {
        var element = child.getElement();
        var x = (this.containerElement.offsetWidth - element.clientWidth)/2;
        var y = (this.containerElement.offsetHeight - element.clientHeight)/2;
        return [x,y];
    }

    //=============================
    // Privat Methods
    //=============================

    _onResize() {
        let windowSize = {x: window.innerWidth, y:window.innerHeight};
        this.windowFrameStack.forEach(childFrame => childFrame.verifyInView(windowSize))
    }

}


