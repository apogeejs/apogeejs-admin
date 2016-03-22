/** This is a window frame component. IT is used the table window and the dialog.
 *
 * It can be minimized an maximized and dragged and resized with the mouse.  
 * 
 * options:
 * minimizable - allow content to be minimized. defaylt value: false
 * maximizable - allow content to be maximized. defaylt value: false
 * closable - display a close button. defalt value: false
 * resizable- allow resizing window with mouse. default vlue: false
 * movable - allow moving window with mouse. default value : false
 *
 * @class 
 */
visicomp.visiui.WindowFrame = function(parentContainer, options) {
	
    if(!options) {
        options = {};
    }
    
    //base init
    visicomp.core.EventManager.init.call(this);
	
    //variables
    this.parentContainer = parentContainer;
    this.parentElement = parentContainer.getContainerElement();
    this.options = options;
    
    this.windowState = visicomp.visiui.WindowFrame.NORMAL; //minimize, normal, maximize
    this.coordinateInfo = {};
    this.isShowing = false;
	
    this.frame = null;
    this.body = null;
    this.titleBar = null;
    this.titleBarLeftElements = null;
    this.titleBarRightElements = null;
    this.content = null;
    
    this.minimizeButton = null;
    this.restoreButton = null;
    this.maximizeButton = null;
    this.closable = null;
    
//can we get rid of this?
this.savedParentOverflow = undefined;
	
    this.windowDragActive = false;
    this.moveOffsetX = null;
    this.moveOffsetX = null;
    //handlers we place on the parent during a move
    this.moveOnMouseMove = null;
    this.moveOnMouseLeave = null;
    this.moveOnMouseUp = null;
	
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeNorthActive = false;
	this.resizeSouthActive = false;
	this.resizeOffsetWidth = null;
	this.resizeOffsetHeight = null;
    //hanlders we place on the parent during a resize
	this.resizeOnMouseUp = null;
	this.resizeOnMouseMove = null;
	this.resizeOnMouseLeave = null;
	
	//these should be set to soemthing more meeaningful, like the minimum sensible width of the title bar
	this.minWidth = 0;
	this.minHeight = 0;
	
    //initialize
    this.initDiv();
    this.createTitleBar();
    this.createBody();
	
    //add the handler to move the active window to the front
    var instance = this;
	var frontHandler = function(e) {
        instance.parentContainer.bringToFront(instance);
    };
    var element = this.getElement();
	element.addEventListener("mousedown",frontHandler);
    
    //this makes sure to update the window when the parent becomes visible
    var onShow = function() {
        //refresh the element
        instance.show();
    }
    var onHide = function() {
        //don't remove element, but mark it as hidden
        instance.isShowing = false;
    }
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.addListener(visicomp.visiui.ParentContainer.CONTENT_SHOWN, onShow);
    parentEventManager.addListener(visicomp.visiui.ParentContainer.CONTENT_HIDDEN, onHide);
}

//add components to this class
visicomp.core.util.mixin(visicomp.visiui.WindowFrame,visicomp.core.EventManager);

visicomp.visiui.WindowFrame.MINIMIZED = -1;
visicomp.visiui.WindowFrame.NORMAL = 0;
visicomp.visiui.WindowFrame.MAXIMIZED = 1;

visicomp.visiui.WindowFrame.MINIMIZE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/minimize.png";
visicomp.visiui.WindowFrame.RESTORE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/restore.png";
visicomp.visiui.WindowFrame.MAXIMIZE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/maximize.png";
visicomp.visiui.WindowFrame.CLOSE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/close.png";
visicomp.visiui.WindowFrame.MENU_IMAGE = visicomp.RESOURCE_DIR + "/hamburger.png";

visicomp.visiui.WindowFrame.RESIZE_LOCATION_SIZE = 10;

//constants for resizing
visicomp.visiui.WindowFrame.RESIZE_TOLERANCE = 5;
visicomp.visiui.WindowFrame.RESIZE_EAST = 1;
visicomp.visiui.WindowFrame.RESIZE_WEST = 2;
visicomp.visiui.WindowFrame.RESIZE_SOUTH = 4;
visicomp.visiui.WindowFrame.RESIZE_NORTH = 8;
visicomp.visiui.WindowFrame.RESIZE_NE = visicomp.visiui.WindowFrame.RESIZE_NORTH + visicomp.visiui.WindowFrame.RESIZE_EAST;
visicomp.visiui.WindowFrame.RESIZE_NW = visicomp.visiui.WindowFrame.RESIZE_NORTH + visicomp.visiui.WindowFrame.RESIZE_WEST;
visicomp.visiui.WindowFrame.RESIZE_SE = visicomp.visiui.WindowFrame.RESIZE_SOUTH + visicomp.visiui.WindowFrame.RESIZE_EAST;
visicomp.visiui.WindowFrame.RESIZE_SW = visicomp.visiui.WindowFrame.RESIZE_SOUTH + visicomp.visiui.WindowFrame.RESIZE_WEST;

//events
visicomp.visiui.WindowFrame.SHOWN = "shown";
visicomp.visiui.WindowFrame.HIDDEN = "hidden";
visicomp.visiui.WindowFrame.RESIZED = "resized";
visicomp.visiui.WindowFrame.RESIZE_STARTED = "resize started";
visicomp.visiui.WindowFrame.RESIZE_ENDED = "resize ended";

//======================================
// CSS STYLES
//======================================

/* window frame */
visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL = {
    //fixed
    "position":"absolute",
    "pointerEvents": "auto", //we need this since we remove pointer evetns from the dialog layer container
    
    
    //configurable
    "background-color":"lightgray",
    "border":"4px solid rgb(122,165,226)",
    "opacity":".95"
};

visicomp.visiui.WindowFrame.FRAME_STYLE_MAX = {
    //fixed
    "position":"absolute",
    "pointerEvents": "auto",
    
    //configurable
    "background-color":"lightgray",
    "border":"",
    "opacity":""
};
visicomp.visiui.WindowFrame.TITLE_BAR_STYLE = {
    //fixed
    "position":"relative",
    
    //configurable
    "background-color":"rgb(122,165,226)",
    "padding":"3px"
};
visicomp.visiui.WindowFrame.BODY_STYLE = {
    //fixed
    "overflow":"auto",
    "position":"relative",
    
    //configurable
    "background-color":"white"  
};
visicomp.visiui.WindowFrame.TITLE_BAR_LEFT_STYLE = {
    //fixed
    "display":"inline-block"
};

visicomp.visiui.WindowFrame.TITLE_BAR_RIGHT_STYLE = {
    //fixed
    "display":"inline-block",
    "float":"right"
};

visicomp.visiui.WindowFrame.TITLE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":"default"
};

visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE = { 
    //fixed
    "display":"inline-block",

    //configurable
    "margin-right":"3px"
};

//====================================
// Public Methods
//====================================

visicomp.visiui.WindowFrame.prototype.getTitle = function(title) {
    return this.title;
}

/** This method sets the title on the window frame.
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is immediately after the menu, if the menu is present. */
visicomp.visiui.WindowFrame.prototype.setTitle = function(title) {
    //title
    this.title = title;
    if(!this.titleElement) {
        this.titleElement = document.createElement("div");
        visicomp.visiui.applyStyle(this.titleElement,visicomp.visiui.WindowFrame.TITLE_BAR_LEFT_STYLE);
    }
    this.titleElement.innerHTML = title;
    this.titleBarLeftElements.appendChild(this.titleElement);
}

/** This gets the menu for the window frame. If this is called, a menu will be added
 * to the window frame, empty or otherwise. If it is not called, there will be no menu. 
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is first. */
visicomp.visiui.WindowFrame.prototype.getMenu = function() {
    if(!this.menu) {
        this.menu = visicomp.visiui.Menu.createMenuFromImage(visicomp.visiui.WindowFrame.MENU_IMAGE);
        this.titleBarLeftElements.appendChild(this.menu.getElement());
    }
    return this.menu;
}

/** This metod sets the scroll policy for the window content div. The default is auto. */
visicomp.visiui.WindowFrame.prototype.setContentDivOverflowPolicy = function(overflow) {
    this.content.style.overflow = overflow;
}


/** This method shows the window. */
visicomp.visiui.WindowFrame.prototype.show = function() {
    if(this.isShowing) return;
    
    //add window to the parent
    this.parentContainer.addWindow(this);

    if(this.parentContainer.getContentIsShowing()) {
        this.isShowing = true;
        this.frameShown();

        //we will redo this since the size of elements used in calculation may have been wrong
        if(this.coordinateInfo.height !== undefined) {
            this.updateCoordinates();
        }
    }
}

/** This method closes the window. */
visicomp.visiui.WindowFrame.prototype.hide = function() {
    this.parentContainer.removeWindow(this);
    if(this.isShowing) {
        this.isShowing = false;
        this.frameHidden();
    }
}

/** This method returns true if the window is showing. */
visicomp.visiui.WindowFrame.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method returns true if the window is showing. */
visicomp.visiui.WindowFrame.prototype.getContentIsShowing = function() {
    return (this.isShowing)&&(this.windowState != visicomp.visiui.WindowFrame.MINIMIZED);
}

/** This method sets the position of the window frame in the parent. */
visicomp.visiui.WindowFrame.prototype.setPosition = function(x,y) {
	//don't let window be placed at a negative coord. We can lose it.
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	this.coordinateInfo.x = x;
	this.coordinateInfo.y = y;
	
    this.updateCoordinates();
}

/** This method sets the size of the window frame, including the title bar. To 
 * size according to content, leave the window frame unsized (or call "clearSize") */
visicomp.visiui.WindowFrame.prototype.setSize = function(width,height) {
    this.coordinateInfo.width = width;
	this.coordinateInfo.height = height;
    
    this.updateCoordinates();
   
    this.frameResized();
}

/** This method clears the size set for the window. The window will be sized 
 * according to the content. */
visicomp.visiui.WindowFrame.prototype.clearSize = function() {
    this.coordinateInfo.width = undefined;
	this.coordinateInfo.height = undefined;
 
    this.updateCoordinates();
    
    this.frameResized();
}

/** This method gets the location and size info for the window. */
visicomp.visiui.WindowFrame.prototype.getCoordinateInfo= function() {
    return this.coordinateInfo;
}

/** This method sets the location and size info for the window. */
visicomp.visiui.WindowFrame.prototype.setCoordinateInfo= function(coordinateInfo) {
    this.coordinateInfo = coordinateInfo;
    this.updateCoordinates();
    this.frameResized();
}

/** This method gets the location and size info for the window. */
visicomp.visiui.WindowFrame.prototype.getWindowState = function() {
    return this.windowState;
}

/** This method sets the location and size info for the window. */
visicomp.visiui.WindowFrame.prototype.setWindowState = function(windowState) {
    switch(windowState) {
        case visicomp.visiui.WindowFrame.NORMAL:
            this.restoreContent();
            break;
            
        case visicomp.visiui.WindowFrame.MINIMIZED:
            this.minimizeContent();
            break;
            
        case visicomp.visiui.WindowFrame.MAXIMIZED:
            this.maximizeContent();
            break;
            
        default:
            alert("Unknown window state: " + windowState);
            break;
    }
}

/** This method returns the main dom element for the window frame. */
visicomp.visiui.WindowFrame.prototype.getElement = function() {
    return this.frame;
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.setContent = function(element) {
    //remove the old content
    while(this.body.firstChild) {
        this.body.removeChild(this.body.firstChild);
    }
	
    //add the new content
    this.content = element;
    if(this.content) {
        this.body.appendChild(this.content);
    }
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.getContent = function() {
    return this.content;
}

/** This method sets the size of the window, including the title bar and other decorations. */
visicomp.visiui.WindowFrame.prototype.setZIndex = function(zIndex) {
    this.frame.style.zIndex = String(zIndex);
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.addTitleBarElement = function(element) {
    this.titleBarLeftElements.appendChild(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.removeTitleBarElement = function(element) {
    this.titleBarLeftElements.appendRemove(element);
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================
/** Mouse down handler for moving the window. */
visicomp.visiui.WindowFrame.prototype.titleBarMouseDown = function(e) {
    //do not do move in maximized state
    if(this.windowState === visicomp.visiui.WindowFrame.MAXIMIZED) return;
    
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
visicomp.visiui.WindowFrame.prototype.titleBarMouseMove = function(e) {
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
visicomp.visiui.WindowFrame.prototype.titleBarMouseUp = function(e) {
    this.endMove();
}

/** Mouse leave handler for moving the window. */
visicomp.visiui.WindowFrame.prototype.titleBarMouseLeave = function(e) {
    this.endMove();
}

/** Mouse down handler for resizing the window. */
visicomp.visiui.WindowFrame.prototype.frameMouseDown = function(e) {
    //do not do resize in maximized state
    if(this.windowState === visicomp.visiui.WindowFrame.MAXIMIZED) return;
    
    var flags = this.getResizeType(e);
	if(flags) {
		if(flags & visicomp.visiui.WindowFrame.RESIZE_EAST) {
			this.resizeEastActive = true;
			this.resizeOffsetWidth = e.clientX - this.frame.clientWidth;
		}
		else if(flags & visicomp.visiui.WindowFrame.RESIZE_WEST) {
			this.resizeWestActive = true;
			this.resizeOffsetWidth = e.clientX + this.frame.clientWidth;
			this.moveOffsetX = e.clientX - this.frame.offsetLeft;
		}
		if(flags & visicomp.visiui.WindowFrame.RESIZE_SOUTH) {
			this.resizeSouthActive = true;
			this.resizeOffsetHeight = e.clientY - this.frame.clientHeight;
		}
		else if(flags & visicomp.visiui.WindowFrame.RESIZE_NORTH) {
			this.resizeNorthActive = true;
			this.resizeOffsetHeight = e.clientY + this.frame.clientHeight;
			this.moveOffsetY = e.clientY - this.frame.offsetTop;
		}

        //add resize events to the parent, since the mouse can leave this element during a move
		this.parentElement.addEventListener("mouseup",this.resizeOnMouseUp);
		this.parentElement.addEventListener("mousemove",this.resizeOnMouseMove);
		this.parentElement.addEventListener("mouseleave",this.resizeOnMouseLeave);
        
        this.dispatchEvent(visicomp.visiui.WindowFrame.RESIZE_STARTED,this);
	}
}

/** Mouse move handler for resizing the window - setting the cursor. */
visicomp.visiui.WindowFrame.prototype.frameMouseMoveCursor = function(e) {
    var flags = this.getResizeType(e);
	if(flags) {
		switch(flags) {
			case visicomp.visiui.WindowFrame.RESIZE_SE:
				this.frame.style.cursor = "se-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_SW:
				this.frame.style.cursor = "sw-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_NE:
				this.frame.style.cursor = "ne-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_NW:
				this.frame.style.cursor = "nw-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_EAST:
				this.frame.style.cursor = "e-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_WEST:
				this.frame.style.cursor = "w-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_SOUTH:
				this.frame.style.cursor = "s-resize";
				break;

			case visicomp.visiui.WindowFrame.RESIZE_NORTH:
				this.frame.style.cursor = "n-resize";
				break;

			default:
				this.frame.style.cursor = "default";
		}	
	}
}

/** Mouse out handler for resizing the window. */
visicomp.visiui.WindowFrame.prototype.frameMouseOutCursor = function(e) {
	this.frame.style.cursor = "default";
}

/** Mouse move handler for resizing the window. */
visicomp.visiui.WindowFrame.prototype.frameMouseMoveResize = function(e) {
    var newHeight;
    var newWidth;
    var newX;
    var newY;
    
	if(this.resizeEastActive) {
		newWidth = e.clientX - this.resizeOffsetWidth;
		if(newWidth < this.minWidth) return;
        this.coordinateInfo.width = newWidth;
	}
	else if(this.resizeWestActive) {
		newWidth = this.resizeOffsetWidth - e.clientX;
		if(newWidth < this.minWidth) return;
		newX = e.clientX - this.moveOffsetX;
		if(newX < 0) newX = 0;
        this.coordinateInfo.width = newWidth;
        this.coordinateInfo.x = newX;
	}
	if(this.resizeSouthActive) {
		newHeight = e.clientY - this.resizeOffsetHeight;
		if(newHeight < this.minHeight) return;
		this.coordinateInfo.height = newHeight;
	}
	else if(this.resizeNorthActive) {
		newHeight = this.resizeOffsetHeight - e.clientY;
		if(newHeight < this.minHeight) return;
		newY = e.clientY - this.moveOffsetY;
		if(newY < 0) newY = 0;
		this.coordinateInfo.height = newHeight;
		this.coordinateInfo.y = newY;
	}
        
	//update coordinates
	this.updateCoordinates();
	
	this.frameResized();
    
}

/** Mouse up handler for resizing the window. */
visicomp.visiui.WindowFrame.prototype.frameMouseUp = function(e) {
    this.endResize();
}

/** Mouse leave handler for resizing the window. */
visicomp.visiui.WindowFrame.prototype.frameMouseLeave = function(e) {
    this.endResize();
}


/** This method ends a move action. 
 * @private */
visicomp.visiui.WindowFrame.prototype.endMove = function(e) {
    this.windowDragActive = false;
    this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentElement.removeEventListener("mouseleave",this.moveOnMouseLeave);
    this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
}

/** this method ends a resize action.
 * @private */
visicomp.visiui.WindowFrame.prototype.endResize = function() {
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeSouthActive = false;
	this.resizeNorthActive = false;
	this.parentElement.removeEventListener("mouseup",this.resizeOnMouseUp);
	this.parentElement.removeEventListener("mousemove",this.resizeOnMouseMove);
	this.parentElement.removeEventListener("mouseleave",this.resizeOnMouseLeave);
    
    this.dispatchEvent(visicomp.visiui.WindowFrame.RESIZE_ENDED,this);
}

/** This methods determines if a mouse location shoudl allow for a resize action.
 * @private */
visicomp.visiui.WindowFrame.prototype.getResizeType = function(e) {
	var flags = 0;
	if(e.target === this.frame) {
		if(this.frame.clientWidth - e.offsetX < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_EAST;
		else if(e.offsetX < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_WEST;
		
		if(this.frame.clientHeight - e.offsetY < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_SOUTH;
		else if(e.offsetY < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_NORTH;
	}
	return flags;
}


//====================================
//  Min/max Methods
//====================================

/** This is the minimize function for the window.*/
visicomp.visiui.WindowFrame.prototype.minimizeContent = function() {
    
    //set body as hidden
    this.body.style.display = "none";
    
    //restore parent overflow, if needed
    if(this.savedParentOverflow !== undefined) {
        this.parentElement.style.overflow = this.savedParentOverflow;
        this.savedParentOverflow = undefined;
    }
    
    //apply the normal style for the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL);
    
    var wasMinimized = (this.windowState === visicomp.visiui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === visicomp.visiui.WindowFrame.MAXIMIZED);
    
    //unsbscribe from parent resize
    if((wasMaximized)&&(this.maximizedResizeHandler)) {
        this.parentContainer.getEventManager().removeListener(visicomp.visiui.WindowFrame.RESIZED,this.maximizedResizeHandler);
        this.parentResizeSubscribed = false;
    }
 
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.MINIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    //dispatch resize event
    if(!wasMinimized) this.contentOnlyHidden();
}

/** This is the restore function for the window.*/
visicomp.visiui.WindowFrame.prototype.restoreContent = function() {
    
    //set body as visible
    this.body.style.display = "";
    
    //restore parent overflow, if needed
    if(this.savedParentOverflow !== undefined) {
        this.parentElement.style.overflow = this.savedParentOverflow;
        this.savedParentOverflow = undefined;
    }
    
    //apply the normal style for the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL);
    
    var wasMinimized = (this.windowState === visicomp.visiui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === visicomp.visiui.WindowFrame.MAXIMIZED);
    
    //unsbscribe from parent resize
    if((wasMaximized)&&(this.maximizedResizeHandler)) {
        this.parentContainer.getEventManager().removeListener(visicomp.visiui.WindowFrame.RESIZED,this.maximizedResizeHandler);
        this.parentResizeSubscribed = false;
    }
    
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.NORMAL;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
    this.frameResized();
}

/** This is the minimize function for the window.*/
visicomp.visiui.WindowFrame.prototype.maximizeContent = function() {
    
    //set body as visible
    this.body.style.display = "";

    //make sure the parent does not have scroll; store the old value
    this.savedParentOverflow = this.parentElement.style.overflow;
    this.parentElement.style.overflow = "hidden";

    //apply the maximized style to the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_MAX);
    
    var wasMinimized = (this.windowState === visicomp.visiui.WindowFrame.MINIMIZED);
    
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.MAXIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
    this.frameResized();
    
    //subscribe to receive the parent resize event and pass it on
    if(this.maximizedResizeHandler) {
        this.parentContainer.getEventManager().addListener(visicomp.visiui.WindowFrame.RESIZED,this.maximizedResizeHandler);
        this.parentResizeSubscribed = true;
    }
}


/** This method ends a move action. 
 * @private */
visicomp.visiui.WindowFrame.prototype.setMinMaxButtons = function() {
    if(this.minimizeButton) {
        if(this.windowState == visicomp.visiui.WindowFrame.MINIMIZED) {
            this.minimizeButton.style.display = "none";
        }
        else {
            this.minimizeButton.style.display = "";
        }
    }
    if(this.restoreButton) {
        if(this.windowState == visicomp.visiui.WindowFrame.NORMAL) {
            this.restoreButton.style.display = "none";
        }
        else {
            this.restoreButton.style.display = "";
        }
    }
    if(this.maximizeButton) {
        if(this.windowState == visicomp.visiui.WindowFrame.MAXIMIZED) {
            this.maximizeButton.style.display = "none";
        }
        else {
            this.maximizeButton.style.display = "";
        }
    }
}

/** @private */
visicomp.visiui.WindowFrame.prototype.updateCoordinates = function() {
    var heightSet;
 
    if(this.windowState === visicomp.visiui.WindowFrame.MAXIMIZED) {
        //apply the maximized coordinates size
        this.frame.style.left = "0px";
		this.frame.style.top = "0px";
		this.frame.style.right = "0px";
		this.frame.style.bottom = "0px";
		
		this.frame.style.height = "";
		this.frame.style.width = "";
        
        heightSet = true;
    }
    else if(this.windowState === visicomp.visiui.WindowFrame.NORMAL) {
        //apply the normal size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		if(this.coordinateInfo.height !== undefined) {
			this.frame.style.height = this.coordinateInfo.height + "px";
			heightSet = true;
		}
		else {
			heightSet = false;
		}
		if(this.coordinateInfo.width !== undefined) {
			this.frame.style.width = this.coordinateInfo.width + "px";
		}
		
		this.frame.style.bottom = "";
		this.frame.style.right = "";
    }
    else if(this.windowState === visicomp.visiui.WindowFrame.MINIMIZED) {
        //apply the minimized size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		
		this.frame.style.height = "";
		this.frame.style.width = "";
		this.frame.style.bottom = "";
		this.frame.style.right = "";
        
        heightSet = false;
    }
    
	//determine the body size, if needed
    if(heightSet) {
        var bodyHeight = this.frame.clientHeight - this.titleBar.clientHeight;
        this.body.style.height = bodyHeight + "px";
    }
	else {
		this.body.style.height = "";
	}
}

/** This method should be called when the entire window is shown.
 * @private */
visicomp.visiui.WindowFrame.prototype.frameShown = function() {
    
    //dispatch event
    this.dispatchEvent(visicomp.visiui.WindowFrame.SHOWN,this);
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method should be called when the entire window is hidden.
 * @private */
visicomp.visiui.WindowFrame.prototype.frameHidden = function() {
    
    //dispatch event
    this.dispatchEvent(visicomp.visiui.WindowFrame.HIDDEN,this);
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_HIDDEN,this);
}

/** This method should be called when the entire window is hidden
 * @private */
visicomp.visiui.WindowFrame.prototype.contentOnlyShown = function() {
    
    //dispatch event
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method shoudl be called when the window contents are show
 * @private */
visicomp.visiui.WindowFrame.prototype.contentOnlyHidden = function() {
    
    //dispatch event
    this.dispatchEvent(visicomp.visiui.ParentContainer.CONTENT_HIDDEN,this);
}

/** This method shold be called when the content is hidden but the window is not..
 * @private */
visicomp.visiui.WindowFrame.prototype.frameResized = function() {
    
    //dispatch event
    this.dispatchEvent(visicomp.visiui.WindowFrame.RESIZED,this);
}

//====================================
// Initialization Methods
//====================================

/** @private */
visicomp.visiui.WindowFrame.prototype.initDiv = function() {
    this.frame = document.createElement("div");
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL);
    
    if(this.options.resizable) {
        var instance = this;

        //events on main frame for mouse resizing 
        this.frame.onmousedown = function(event) {
            instance.frameMouseDown(event);
        }

        this.frame.onmousemove = function(event) {
            instance.frameMouseMoveCursor(event);
        };

        this.frame.onmouseout = function(event) {
            instance.frameMouseOutCursor(event);
        };

        //mouse window resize events we will place on the parent container - since the mouse drag 
        //may leave the window frame during the resize
        this.resizeOnMouseMove = function(event) {
            instance.frameMouseMoveResize(event);
        };
        this.resizeOnMouseLeave = function(event) {
            instance.frameMouseLeave(event);
        };
        this.resizeOnMouseUp = function(event) {
            instance.frameMouseUp(event);
        };
    }
	
	//prevent default drag action
    var defaultDragHandler = function(e) {e.preventDefault();};
    this.frame.addEventListener("mousemove",defaultDragHandler);
}

/** @private */
visicomp.visiui.WindowFrame.prototype.createTitleBar = function() {
    //create title bar
    this.titleBar = document.createElement("div");
    visicomp.visiui.applyStyle(this.titleBar,visicomp.visiui.WindowFrame.TITLE_BAR_STYLE);
    this.frame.appendChild(this.titleBar);
	
    //add elements
    this.titleBarLeftElements = document.createElement("div");
    visicomp.visiui.applyStyle(this.titleBarLeftElements,visicomp.visiui.WindowFrame.TITLE_BAR_LEFT_STYLE);
    this.titleBar.appendChild(this.titleBarLeftElements);
    this.titleBarRightElements = document.createElement("div");
    visicomp.visiui.applyStyle(this.titleBarRightElements,visicomp.visiui.WindowFrame.TITLE_BAR_RIGHT_STYLE);
    this.titleBar.appendChild(this.titleBarRightElements);

    //for handlers below
    var instance = this;
    
    //add window commands ( we will hide the bottons that are not needed)
    //minimize button
    if(this.options.minimizable) {
        this.minimizeButton = document.createElement("img");
        visicomp.visiui.applyStyle(this.minimizeButton,visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.minimizeButton.src = visicomp.visiui.WindowFrame.MINIMIZE_CMD_IMAGE;
        this.minimizeButton.onclick = function() {
            instance.minimizeContent();
        }
        this.titleBarRightElements.appendChild(this.minimizeButton);
    }
	
    //restore button - only if we cn minimize or maximize
    if(this.options.minimizable || this.options.maximizable) {	
        this.restoreButton = document.createElement("img");
        visicomp.visiui.applyStyle(this.restoreButton,visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.restoreButton.src = visicomp.visiui.WindowFrame.RESTORE_CMD_IMAGE;
        this.restoreButton.onclick = function() {
            instance.restoreContent();
        }
        this.titleBarRightElements.appendChild(this.restoreButton);
    }
    
    //maximize button and logic
    if(this.options.maximizable) {
        this.maximizeButton = document.createElement("img");
        visicomp.visiui.applyStyle(this.maximizeButton,visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.maximizeButton.src = visicomp.visiui.WindowFrame.MAXIMIZE_CMD_IMAGE;
        this.maximizeButton.onclick = function() {
            instance.maximizeContent();
        }
        this.titleBarRightElements.appendChild(this.maximizeButton);
        
        //save this - it should be present if we allow maximize 
        this.parentResizeSubscribed = false;
        //we must pass the resize event from parent to child when maximized
        this.maximizedResizeHandler = function() {
            instance.updateCoordinates();
            instance.frameResized();
        }
    }
    
    //layout the window buttons
    this.windowState = visicomp.visiui.WindowFrame.NORMAL;
    this.setMinMaxButtons();
    
    //close button
    if(this.options.closable) {
        this.closeButton = document.createElement("img");
        visicomp.visiui.applyStyle(this.closeButton,visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.closeButton.src = visicomp.visiui.WindowFrame.CLOSE_CMD_IMAGE;
        this.closeButton.onclick = function() {
            instance.hide();
        }
        this.titleBarRightElements.appendChild(this.closeButton);
    }
    
    //mouse move and resize
    if(this.options.movable) {
        //add mouse handlers for moving the window 
        this.titleBar.onmousedown = function(event) {
            instance.titleBarMouseDown(event);
        }

        //mouse window drag events we will place on the parent container - since the mouse drag 
        //may leave the window frame during the move
        this.moveOnMouseMove = function(event) {
            instance.titleBarMouseMove(event);
        };
        this.moveOnMouseLeave = function(event) {
            instance.titleBarMouseLeave(event);
        }
        this.moveOnMouseUp = function(event) {
            instance.titleBarMouseUp(event);
        }
    }
	
	//prevent default drag action
	var defaultDragHandler = function(e) {e.preventDefault();};
    this.titleBar.addEventListener("mousemove",defaultDragHandler);
}
	
/** @private */
visicomp.visiui.WindowFrame.prototype.createBody = function() {
    this.body = document.createElement("div");
    visicomp.visiui.applyStyle(this.body,visicomp.visiui.WindowFrame.BODY_STYLE);
    this.frame.appendChild(this.body);
	
	//prevent default drag action
	var defaultDragHandler = function(e) {e.preventDefault();};
    this.body.addEventListener("mousemove",defaultDragHandler);
}

