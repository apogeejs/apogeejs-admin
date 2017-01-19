/** This is a window icon component.
 *
 * @class 
 */
haxapp.ui.WindowIcon = function(options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    //base init
    hax.EventManager.init.call(this);
	
    //variables
    this.parentContainer = null;
    this.parentElement = null;
    this.options = options;
    
	//set default size values
	this.coordinateInfo = {};
	this.coordinateInfo.x = 0;
	this.coordinateInfo.y = 0;
	this.coordinateInfo.width = haxapp.ui.WindowIcon.DEFAULT_WINDOW_WIDTH;
	this.coordinateInfo.height = haxapp.ui.WindowIcon.DEFAULT_WINDOW_HEIGHT;
    
    this.windowDragActive = false;
    this.moveOffsetX = null;
    this.moveOffsetX = null;
    //handlers we place on the parent during a move
    this.moveOnMouseMove = null;
    this.moveOnMouseLeave = null;
    this.moveOnMouseUp = null;
	
    //initialize
    this.frame = haxapp.ui.createElementWithClass("div","visiui_winicon_frame");
    this.title = null;
    this.icon = null; //we don't have this yet 
    
    this.setMouseHandlers();
	
    //add the handler to move the active window to the front
    var instance = this;
	var frontHandler = function(e) {
        instance.parentContainer.bringToFront(instance);
    };
    var element = this.getElement();
	element.addEventListener("mousedown",frontHandler);
    
    //this makes sure to update the window when the parent becomes visible
    this.onShow = function() {
        //refresh the element
        instance.show();
    }
    this.onHide = function() {
        //don't remove element, but mark it as hidden
        instance.isShowing = false;
    }   
}

//add components to this class
hax.base.mixin(haxapp.ui.WindowIcon,hax.EventManager);


//====================================
// Public Methods
//====================================

/** This method shows the window. */
haxapp.ui.WindowIcon.prototype.getTitle = function() {
    return this.title;
}

/** This method shows the window. */
haxapp.ui.WindowIcon.prototype.setTitle = function(title) {
    if((title === null)||(title === undefined)||(title.length === 0)) {
		title = "&nbsp;";
	}
   this.title = title;
   this.frame.innerHTML = title;
}

/** This method shows the window. */
haxapp.ui.WindowIcon.prototype.getMenu = function() {
    return null;
}


//---------------------------
// WINDOW CHILD
//---------------------------

/** This method shows the window. */
haxapp.ui.WindowIcon.prototype.setParent = function(newParentContainer) {
    if(this.parentContainer) {
        this.hide();
        var oldParentContainer = this.parentContainer;
        var oldParentEventManager = oldParentContainer.getEventManager();
        oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
        oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    }
    
    this.parentContainer = newParentContainer;
    this.parentElement = newParentContainer.getContainerElement();
    
    var newParentEventManager = newParentContainer.getEventManager();
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.show();
}

/** This method shows the window. */
haxapp.ui.WindowIcon.prototype.show = function() {
    if(this.isShowing) return;
    
    //add window to the parent
    this.parentContainer.addWindow(this);

    if(this.parentContainer.getContentIsShowing()) {
        this.isShowing = true;
        this.frameShown();
    }
}

/** This method hides the window. */
haxapp.ui.WindowIcon.prototype.hide = function() {
    this.parentContainer.removeWindow(this);
    if(this.isShowing) {
        this.isShowing = false;
        this.frameHidden();
    }
}

/** This method closes the window. */
haxapp.ui.WindowIcon.prototype.deleteWindow = function() {
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.hide();
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowIcon.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowIcon.prototype.getContentIsShowing = function() {
    return false;
}

/** This method sets the position of the window frame in the parent. */
haxapp.ui.WindowIcon.prototype.setPosition = function(x,y) {
	//don't let window be placed at a negative coord. We can lose it.
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	this.coordinateInfo.x = x;
	this.coordinateInfo.y = y;
	
    this.updateCoordinates();
}

/** This method gets the location and size info for the window. */
haxapp.ui.WindowIcon.prototype.getCoordinateInfo= function() {
    return this.coordinateInfo;
}

/** This method sets the location and size info for the window. */
haxapp.ui.WindowIcon.prototype.setCoordinateInfo= function(coordinateInfo) {
    this.coordinateInfo = coordinateInfo;
    this.updateCoordinates();
}

/** This method returns the window body.*/
haxapp.ui.WindowIcon.prototype.getParent = function() {
    return this.parentContainer;
}

/** This method sets the size of the window, including the title bar and other decorations. */
haxapp.ui.WindowIcon.prototype.setZIndex = function(zIndex) {
    this.frame.style.zIndex = String(zIndex);
}

//---------------------------
// GUI ELEMENT
//---------------------------


/** This method returns the main dom element for the window frame. */
haxapp.ui.WindowIcon.prototype.getElement = function() {
    return this.frame;
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================

/** Mouse down handler for moving the window. */
haxapp.ui.WindowIcon.prototype.moveMouseDown = function(e) {
    
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
haxapp.ui.WindowIcon.prototype.moveMouseMove = function(e) {
    if(!this.windowDragActive) return;
	var newX = e.clientX - this.moveOffsetX;
	if(newX < 0) newX = 0;
	var newY = e.clientY - this.moveOffsetY;
	if(newY < 0) newY = 0;
    this.coordinateInfo.x = newX;
    this.coordinateInfo.y = newY;
    this.updateCoordinates();
}

/** Mouse up handler for moving the window. */
haxapp.ui.WindowIcon.prototype.moveMouseUp = function(e) {
    this.endMove();
}

/** Mouse leave handler for moving the window. */
haxapp.ui.WindowIcon.prototype.moveMouseLeave = function(e) {
    this.endMove();
}

/** This method ends a move action. 
 * @private */
haxapp.ui.WindowIcon.prototype.endMove = function(e) {
    this.windowDragActive = false;
    this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
}

/** @private */
haxapp.ui.WindowIcon.prototype.updateCoordinates = function() {
    this.frame.style.left = this.coordinateInfo.x + "px";
    this.frame.style.top = this.coordinateInfo.y + "px";
}

/** This method should be called when the entire window is shown.
 * @private */
haxapp.ui.WindowIcon.prototype.frameShown = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method should be called when the entire window is hidden.
 * @private */
haxapp.ui.WindowIcon.prototype.frameHidden = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}

//====================================
// Initialization Methods
//====================================


/** @private */
haxapp.ui.WindowIcon.prototype.setMouseHandlers = function() {

      //add mouse move control
    //mouse move and resize
    var instance = this;
    
    //add mouse handlers for moving the window 
    this.frame.onmousedown = function(event) {
        instance.moveMouseDown(event);
    }

    //mouse window drag events we will place on the parent container - since the mouse drag 
    //may leave the window frame during the move
    this.moveOnMouseMove = function(event) {
        instance.moveMouseMove(event);
    };
    this.moveOnMouseUp = function(event) {
        instance.moveMouseUp(event);
    }
    this.moveOnMouseLeave = function(event) {
        instance.moveMouseLeave(event);
    }
}
