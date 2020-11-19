import uiutil from "/apogeeui/uiutil.js";

/** This is a simple window frame component. It is movable but not resizable.
 *
 * @class 
 */
export default class DialogFrame {

    constructor() {
        
        //variables
        this.windowParent = null;
        this.parentElement = null;
        
        //set default size values
        this.posInfo = {};
        this.posInfo.x = 0;
        this.posInfo.y = 0;
        
        this.frame = null;
        this.headerBar = null;
        this.body = null;
        
        this.content = null;
        
        this.windowDragActive = false;
        this.moveOffsetX = null;
        this.moveOffsetY = null;
        
        this.moveOnMouseDown = null;
        //handlers we place on the parent during a move
        this.moveOnMouseMove = null; 
        this.moveOnMouseLeave = null;
        this.moveOnMouseUp = null;
        
        //initialize
        this.initUI();
    }


    //====================================
    // Public Methods
    //====================================


    /** This sets the content for the window. */
    setContent(contentElement) {
        uiutil.removeAllChildren(this.body);
        this.body.appendChild(contentElement);
        
        this.content = contentElement;
    }

    //---------------------------
    // WINDOW CHILD
    //---------------------------

    /** This method returns the parent container for the window.*/
    getParent() {
        return this.windowParent;
    }

    /** This method closes the window. */
    close() {
        this.headerBar.removeEventListener("mousedown",this.moveOnMouseDown);

        if(!this.windowParent) return;
        this.windowParent.removeWindow(this);
        this.windowParent = null;
    }

    /** This method moves the window if it starts going off the page. */
    verifyInView(windowSize) {
        if((!this.posInfo)||(!this.frame)) return;

        let centerX = this.posInfo.x + this.frame.clientWidth/2;
        let centerY = this.posInfo.y + this.frame.clientHeight/2;

        if( ((centerX > windowSize.x)&&(centerX > 0)) ||
            ((centerY > windowSize.y)&&(centerY > 0)) ) {
            this.centerInParent();
        }
    }

    /** This method sets the position of the window frame in the parent. */
    setPosition(x,y) {
        //don't let window be placed at a negative coord. We can lose it.
        if(x < 0) x = 0;
        if(y < 0) y = 0;
        this.posInfo.x = x;
        this.posInfo.y = y;
        
        this.updateCoordinates();
    }


    //---------------------------
    // GUI ELEMENT
    //---------------------------

    /** This method returns the main dom element for the window frame. */
    getElement() {
        return this.frame;
    }

    /** This method centers the window in its parent. it should only be called
     *after the window is shown. */
    centerInParent() {
        var coords = this.windowParent.getCenterOnPagePosition(this);
        this.setPosition(coords[0],coords[1]);
    }

    //================================
    // Internal
    //================================

    /** This method shows the window. This automatically called internally when the window is
     * added to the parent. */
    onAddedToParent(newWindowParent) {
        this.windowParent = newWindowParent;
        this.parentElement = newWindowParent.getOuterElement();
    }

    //====================================
    // Motion/Reseize Event Handlers and functions
    //====================================

    /** Mouse down handler for moving the window. */
    moveMouseDown(e) {
        if(this.parentElement) {
            this.windowDragActive = true;
            this.moveOffsetX = e.clientX - this.frame.offsetLeft;
            this.moveOffsetY = e.clientY - this.frame.offsetTop;
            
            //add move events to the parent, since the mouse can leave this element during a move
            this.parentElement.addEventListener("mousemove",this.moveOnMouseMove);
            this.parentElement.addEventListener("mouseleave",this.moveOnMouseLeave);
            this.parentElement.addEventListener("mouseup",this.moveOnMouseUp);
            
            //move start event would go here
        }
    }

    /** Mouse m,ove handler for moving the window. */
    moveMouseMoveImpl(e) {
        if(!this.windowDragActive) return;
        var newX = e.clientX - this.moveOffsetX;
        if(newX < 0) newX = 0;
        var newY = e.clientY - this.moveOffsetY;
        if(newY < 0) newY = 0;
        this.posInfo.x = newX;
        this.posInfo.y = newY;
        this.updateCoordinates();
    }

    /** Mouse up handler for moving the window. */
    moveMouseUpImpl(e) {
        this.endMove();
    }

    /** Mouse leave handler for moving the window. */
    moveMouseLeaveImpl(e) {
        this.endMove();
    }

    /** This method ends a move action. 
     * @private */
    endMove(e) {
        this.windowDragActive = false;
        this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
        this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
        this.parentElement.removeEventListener("mouseleave",this.moveOnMouseLeave);
    }

    /** @private */
    updateCoordinates() {
        this.frame.style.left = this.posInfo.x + "px";
        this.frame.style.top = this.posInfo.y + "px";
    }

    //====================================
    // Initialization Methods
    //====================================

    /** @private */
    initUI() {

        this.frame = document.createElement("div");
        this.frame.className = "visiui_dialog_main";

        this.headerBar = document.createElement("div");
        this.headerBar.className = "visiui_dialog_header";
        this.frame.appendChild(this.headerBar);

        //add mouse handlers for moving the window 
        this.moveOnMouseDown = (event) => {
            this.moveMouseDown(event);
        }
        //these are added only during a move
        this.moveOnMouseMove = (event) => {
            this.moveMouseMoveImpl(event);
        };
        this.moveOnMouseUp = (event) => {
            this.moveMouseUpImpl(event);
        }
        this.moveOnMouseLeave = (event) => {
            this.moveMouseLeaveImpl(event);
        }

        this.headerBar.addEventListener("mousedown",this.moveOnMouseDown);

        this.body = document.createElement("div");
        this.body.className = "visiui_dialog_body";
        this.frame.appendChild(this.body);
    }


}

/** This constant is used in moving the window if the browser is resized too much. */
const IN_VIEW_PADDING = 10;

