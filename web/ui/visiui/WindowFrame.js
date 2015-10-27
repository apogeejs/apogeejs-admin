/** This is a window frame component. IT is used the table window and the dialog.
 *
 *It can be minimized an maximized and dragged and resized with the mouse.  
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
visicomp.visiui.WindowFrame = function(parentContainer, title, options) {
	
    if(!options) {
        options = {};
    }
	
    //variables
    this.parentContainer = parentContainer;
    this.title = title;
    this.options = options;
	
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
    
    this.windowState = false; //minimize, normal, maximize
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
    
    //event manager
    this.eventManager = new visicomp.core.EventManager();
    
    //these styles control the position and size
    this.coordStyleBody = {
        "width":"",
        "height":""
    };
    this.coordStyleFrame = {
        "left":"",
        "top":"",
        "width":"",
        "height":""
    };
	
	//these should be set to soemthing more meeaningful, like the minimum widht of the title bar
	this.minWidth = 0;
	this.minHeight = 0;
	
    //initialize
    this.initDiv();
    this.createTitleBar();
    this.createBody();
}

visicomp.visiui.WindowFrame.MINIMIZED = -1;
visicomp.visiui.WindowFrame.NORMAL = 0;
visicomp.visiui.WindowFrame.MAXIMIZED = 1;

visicomp.visiui.WindowFrame.MINIMIZE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/minimize.png";
visicomp.visiui.WindowFrame.RESTORE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/restore.png";
visicomp.visiui.WindowFrame.MAXIMIZE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/maximize.png";
visicomp.visiui.WindowFrame.CLOSE_CMD_IMAGE = visicomp.RESOURCE_DIR + "/close.png";

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

//======================================
// CSS STYLES
//======================================

/* window frame */
visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL = {
    //fixed
    "display":"table",
    "position":"absolute",
    
    //configurable
    "background-color":"lightgray",
    "border":"4px solid rgb(122,165,226)",
    "opacity":".95"
};

visicomp.visiui.WindowFrame.FRAME_STYLE_MAX = {
    //fixed
    "display":"table",
    "position":"absolute",
    "border":"",
    "opacity":"",
    
    //configurable
    "background-color":"lightgray"
};
visicomp.visiui.WindowFrame.COORD_STYLE_FRAME_MAX = {
    //fixed
    "left":"0",
    "top":"0",
    "width":"100%",
    "height":"100%"
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
visicomp.visiui.WindowFrame.COORD_STYLE_BODY_MAX = {
    //fixed
    "width":"100%",
    "height":"100%"
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
    "display":"inline",
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

/** This method shows the window. */
visicomp.visiui.WindowFrame.prototype.show = function() {
    this.parentContainer.appendChild(this.getElement());
    this.eventManager.dispatchEvent("show",this);
}

/** This method closes the window. */
visicomp.visiui.WindowFrame.prototype.hide = function() {
    this.parentContainer.removeChild(this.getElement());
    this.eventManager.dispatchEvent("hide",this);
}

/** This method sets the position of the window frame in the parent. */
visicomp.visiui.WindowFrame.prototype.setPosition = function(x,y) {
    this.coordStyleFrame.left = x + "px";
    this.coordStyleFrame.top = y + "px";
    this.updateCoordinateStyle();
}

/** This method sets the size of the window content, not including the title bar and other decorations. */
visicomp.visiui.WindowFrame.prototype.setSize = function(width,height) {
    this.coordStyleBody.width = width + "px";
    this.coordStyleBody.height = height + "px";
    this.updateCoordinateStyle();
    
    //dispatch resize event
    this.eventManager.dispatchEvent("resize",this);
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
visicomp.visiui.WindowFrame.prototype.addElement = function(element) {
    this.titleBarLeftElements.appendChild(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.removeElement = function(element) {
    this.titleBarLeftElements.appendRemove(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
visicomp.visiui.WindowFrame.prototype.getEventManager= function() {
    return this.eventManager;
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================
/** Mouse down handler for moving the window. */
visicomp.visiui.WindowFrame.prototype.titleBarMouseDown = function(e) {
    //do not do move in maximized state
    if(this.windowState == visicomp.visiui.WindowFrame.MAXIMIZED) return;
    
    if(this.parentContainer) {
        this.windowDragActive = true;
        this.moveOffsetX = e.x - this.frame.offsetLeft;
        this.moveOffsetY = e.y - this.frame.offsetTop;
		
        //add move events to the parent, since the mouse can leave this element during a move
        this.parentContainer.addEventListener("mousemove",this.moveOnMouseMove);
        this.parentContainer.addEventListener("mouseleave",this.moveOnMouseLeave);
        this.parentContainer.addEventListener("mouseup",this.moveOnMouseUp);
    }
}

/** Mouse m,ove handler for moving the window. */
visicomp.visiui.WindowFrame.prototype.titleBarMouseMove = function(e) {
    if(!this.windowDragActive) return;
    var newX = e.x - this.moveOffsetX;
    var newY = e.y - this.moveOffsetY;
    this.setPosition(newX,newY);
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
    if(this.windowState == visicomp.visiui.WindowFrame.MAXIMIZED) return;
    
    var flags = this.getResizeType(e);
	if(flags) {
		if(flags & visicomp.visiui.WindowFrame.RESIZE_EAST) {
			this.resizeEastActive = true;
			this.resizeOffsetWidth = e.x - this.body.offsetWidth;
		}
		else if(flags & visicomp.visiui.WindowFrame.RESIZE_WEST) {
			this.resizeWestActive = true;
			this.resizeOffsetWidth = e.x + this.body.offsetWidth;
			this.moveOffsetX = e.x - this.frame.offsetLeft;
		}
		if(flags & visicomp.visiui.WindowFrame.RESIZE_SOUTH) {
			this.resizeSouthActive = true;
			this.resizeOffsetHeight = e.y - this.body.offsetHeight;
		}
		else if(flags & visicomp.visiui.WindowFrame.RESIZE_NORTH) {
			this.resizeNorthActive = true;
			this.resizeOffsetHeight = e.y + this.body.offsetHeight;
			this.moveOffsetY = e.y - this.frame.offsetTop;
		}

        //add resize events to the parent, since the mouse can leave this element during a move
		this.parentContainer.addEventListener("mouseup",this.resizeOnMouseUp);
		this.parentContainer.addEventListener("mousemove",this.resizeOnMouseMove);
		this.parentContainer.addEventListener("mouseleave",this.resizeOnMouseLeave);
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
    var newLeft;
    var newTop;
   
	if(this.resizeEastActive) {
		newWidth = e.x - this.resizeOffsetWidth;
		if(newWidth < this.minWidth) return;
        this.coordStyleBody.width = newWidth + "px";
	}
	else if(this.resizeWestActive) {
		newWidth = this.resizeOffsetWidth - e.x;
		if(newWidth < this.minWidth) return;
		newLeft = e.x - this.moveOffsetX;
        this.coordStyleBody.width = newWidth + "px";
        this.coordStyleFrame.left = newLeft + "px";
	}
	if(this.resizeSouthActive) {
		newHeight = e.y - this.resizeOffsetHeight;
		if(newHeight < this.minHeight) return;
		this.coordStyleBody.height = newHeight + "px";
	}
	else if(this.resizeNorthActive) {
		newHeight = this.resizeOffsetHeight - e.y;
		if(newHeight < this.minHeight) return;
		newTop = e.y - this.moveOffsetY;
		this.coordStyleBody.height = newHeight + "px";
		this.coordStyleFrame.top = newTop + "px";
	}
    
    //update coordinates
    this.updateCoordinateStyle();
    
    //dispatch resize event
    this.eventManager.dispatchEvent("resize",this);
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
    this.parentContainer.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentContainer.removeEventListener("mouseleave",this.moveOnMouseLeave);
    this.parentContainer.removeEventListener("mouseup",this.moveOnMouseUp);
}

/** this method ends a resize action.
 * @private */
visicomp.visiui.WindowFrame.prototype.endResize = function() {
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeSouthActive = false;
	this.resizeNorthActive = false;
	this.parentContainer.removeEventListener("mouseup",this.resizeOnMouseUp);
	this.parentContainer.removeEventListener("mousemove",this.resizeOnMouseMove);
	this.parentContainer.removeEventListener("mouseleave",this.resizeOnMouseLeave);
}

/** This methods determines if a mouse location shoudl allow for a resize action.
 * @private */
visicomp.visiui.WindowFrame.prototype.getResizeType = function(e) {
	var flags = 0;
	if(e.target === this.frame) {
		if(this.frame.offsetWidth - e.offsetX < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_EAST;
		else if(e.offsetX < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_WEST;
		
		if(this.frame.offsetHeight - e.offsetY < visicomp.visiui.WindowFrame.RESIZE_TOLERANCE) flags |= visicomp.visiui.WindowFrame.RESIZE_SOUTH;
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
        this.parentContainer.style.overflow = this.savedParentOverflow;
        this.savedParentOverflow = undefined;
    }
    
    //apply the normal style for the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL);
    
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.MINIMIZED;
    this.updateCoordinateStyle();
    this.setMinMaxButtons();
    
    //dispatch resize event
    this.eventManager.dispatchEvent("minimize",this);
}

/** This is the restore function for the window.*/
visicomp.visiui.WindowFrame.prototype.restoreContent = function() {
    
    //set body as visible
    this.body.style.display = "";
    
    //restore parent overflow, if needed
    if(this.savedParentOverflow !== undefined) {
        this.parentContainer.style.overflow = this.savedParentOverflow;
        this.savedParentOverflow = undefined;
    }
    
    //apply the normal style for the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_NORMAL);
    
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.NORMAL;
    this.updateCoordinateStyle();
    this.setMinMaxButtons();
    
    //dispatch resize event
    this.eventManager.dispatchEvent("resize",this);
}

/** This is the minimize function for the window.*/
visicomp.visiui.WindowFrame.prototype.maximizeContent = function() {
    
    //set body as visible
    this.body.style.display = "";

    //make sure the parent does not have scroll; store the old value
    this.savedParentOverflow = this.parentContainer.style.overflow;
    this.parentContainer.style.overflow = "hidden";

    //apply the maximized style to the frame
    visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.FRAME_STYLE_MAX);
    
    //set the window state
    this.windowState = visicomp.visiui.WindowFrame.MAXIMIZED;
    this.updateCoordinateStyle();
    this.setMinMaxButtons();
    
    //dispatch resize event
    this.eventManager.dispatchEvent("resize",this);
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
visicomp.visiui.WindowFrame.prototype.updateCoordinateStyle = function() {
    if(this.windowState == visicomp.visiui.WindowFrame.MAXIMIZED) {
        //apply the maximized coordinates style
        visicomp.visiui.applyStyle(this.frame,visicomp.visiui.WindowFrame.COORD_STYLE_FRAME_MAX);
        visicomp.visiui.applyStyle(this.body,visicomp.visiui.WindowFrame.COORD_STYLE_BODY_MAX);
    }
    else {
        //apply the normal coordinate style
        visicomp.visiui.applyStyle(this.frame,this.coordStyleFrame);
        visicomp.visiui.applyStyle(this.body,this.coordStyleBody);
    }
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
            instance.frameMouseMoveCursor(event)
        };

        this.frame.onmouseout = function(event) {
            instance.frameMouseOutCursor(event)
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
    
    //title
    this.titleElement = document.createElement("div");
    visicomp.visiui.applyStyle(this.titleElement,visicomp.visiui.WindowFrame.TITLE_BAR_LEFT_STYLE);
    this.titleElement.innerHTML = this.title;
    this.titleBarLeftElements.appendChild(this.titleElement);

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
    
    //maximize button
    if(this.options.maximizable) {
        this.maximizeButton = document.createElement("img");
        visicomp.visiui.applyStyle(this.maximizeButton,visicomp.visiui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.maximizeButton.src = visicomp.visiui.WindowFrame.MAXIMIZE_CMD_IMAGE;
        this.maximizeButton.onclick = function() {
            instance.maximizeContent();
        }
        this.titleBarRightElements.appendChild(this.maximizeButton);
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
