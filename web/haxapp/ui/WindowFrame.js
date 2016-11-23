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
haxapp.ui.WindowFrame = function(parentContainer, options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    if(!options.frameColorClass) options.frameColorClass = haxapp.ui.WindowFrame.DEFAULT_FRAME_COLOR_CLASS;
    if(!options.titleBarClass) options.titleBarClass = haxapp.ui.WindowFrame.DEFAULT_TITLE_BAR_CLASS;
    
    //base init
    hax.EventManager.init.call(this);
	
    //variables
    this.parentContainer = parentContainer;
    this.parentElement = parentContainer.getContainerElement();
    this.options = options;

    this.windowState = haxapp.ui.WindowFrame.NORMAL; //minimize, normal, maximize
    
	//set default size values
	this.coordinateInfo = {};
	this.coordinateInfo.x = 0;
	this.coordinateInfo.y = 0;
	this.coordinateInfo.width = haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH;
	this.coordinateInfo.height = haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT;
	
    this.isShowing = false;
	
    this.frame = null;
    this.titleCell = null;
    this.bodyCell = null;
    this.headerCell = null;
    
    this.titleBar = null;
    this.titleBarLeftElements = null;
    this.titleBarRightElements = null;
    
    this.header = null;
    
    this.body = null;
    this.content = null;
    
    this.minimizeButton = null;
    this.restoreButton = null;
    this.maximizeButton = null;
    this.closable = null;
    
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
    this.initUI();
	
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
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    parentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
}

//add components to this class
hax.util.mixin(haxapp.ui.WindowFrame,hax.EventManager);

haxapp.ui.WindowFrame.MINIMIZED = -1;
haxapp.ui.WindowFrame.NORMAL = 0;
haxapp.ui.WindowFrame.MAXIMIZED = 1;

haxapp.ui.WindowFrame.MINIMIZE_CMD_IMAGE = "/minimize.png";
haxapp.ui.WindowFrame.RESTORE_CMD_IMAGE = "/restore.png";
haxapp.ui.WindowFrame.MAXIMIZE_CMD_IMAGE = "/maximize.png";
haxapp.ui.WindowFrame.CLOSE_CMD_IMAGE = "/close.png";
haxapp.ui.WindowFrame.MENU_IMAGE = "/hamburger.png";

haxapp.ui.WindowFrame.RESIZE_LOCATION_SIZE = 10;

//constants for resizing
haxapp.ui.WindowFrame.RESIZE_TOLERANCE = 5;
haxapp.ui.WindowFrame.RESIZE_EAST = 1;
haxapp.ui.WindowFrame.RESIZE_WEST = 2;
haxapp.ui.WindowFrame.RESIZE_SOUTH = 4;
haxapp.ui.WindowFrame.RESIZE_NORTH = 8;
haxapp.ui.WindowFrame.RESIZE_NE = haxapp.ui.WindowFrame.RESIZE_NORTH + haxapp.ui.WindowFrame.RESIZE_EAST;
haxapp.ui.WindowFrame.RESIZE_NW = haxapp.ui.WindowFrame.RESIZE_NORTH + haxapp.ui.WindowFrame.RESIZE_WEST;
haxapp.ui.WindowFrame.RESIZE_SE = haxapp.ui.WindowFrame.RESIZE_SOUTH + haxapp.ui.WindowFrame.RESIZE_EAST;
haxapp.ui.WindowFrame.RESIZE_SW = haxapp.ui.WindowFrame.RESIZE_SOUTH + haxapp.ui.WindowFrame.RESIZE_WEST;

/** size must be speicifed for the window. If not these values are used. */
haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT = 300;
haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH = 300;

haxapp.ui.WindowFrame.DEFAULT_TITLE_BAR_CLASS = "visiui_win_titleBarClass";
haxapp.ui.WindowFrame.DEFAULT_FRAME_COLOR_CLASS = "visiui_win_windowColorClass";

//======================================
// CSS STYLES
//======================================

haxapp.ui.WindowFrame.TITLE_BAR_LEFT_STYLE = {
    //fixed
    "display":"inline",
    "width":"100%"
};

haxapp.ui.WindowFrame.TITLE_BAR_RIGHT_STYLE = {
    //fixed
    "float":"right",
    "display":"inline"
};

haxapp.ui.WindowFrame.TITLE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":"default",
    "font-weight":"bold",
    "color":"darkblue"
    
};

haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE = { 
    //fixed
    "display":"inline-block",

    //configurable
    "marginRight":"3px"
};

//====================================
// Public Methods
//====================================

haxapp.ui.WindowFrame.prototype.getTitle = function(title) {
    return this.title;
}

/** This method sets the title on the window frame.
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is immediately after the menu, if the menu is present. */
haxapp.ui.WindowFrame.prototype.setTitle = function(title) {
	if((title === null)||(title === undefined)||(title.length === 0)) {
		title = "&nbsp;";
	}
    //title
    this.title = title;
    if(!this.titleElement) {
        this.titleElement = document.createElement("div");
        haxapp.ui.applyStyle(this.titleElement,haxapp.ui.WindowFrame.TITLE_STYLE);
    }
    this.titleElement.innerHTML = title;
    this.titleBarLeftElements.appendChild(this.titleElement);
}

/** This gets the menu for the window frame. If this is called, a menu will be added
 * to the window frame, empty or otherwise. If it is not called, there will be no menu. 
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is first. */
haxapp.ui.WindowFrame.prototype.getMenu = function() {
    if(!this.menu) {
        this.menu = haxapp.ui.Menu.createMenuFromImage(haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MENU_IMAGE));
		var firstLeftElementChild = this.titleBarLeftElements.firstChild;
		if(firstLeftElementChild) {
			this.titleBarLeftElements.insertBefore(this.menu.getElement(),firstLeftElementChild);
		}
		else {
			this.titleBarLeftElements.appendChild(this.menu.getElement());
		}
    }
    return this.menu;
}

/** This method sets the headers for the window. They appreare between the title
 * bar and the body. The elements should typicaly be "block" type components, such
 * as a div.
 */
haxapp.ui.WindowFrame.prototype.loadHeaders = function(headerElements) {
    hax.util.removeAllChildren(this.headerElement);
    if(headerElements.length > 0) {
        for(var i = 0; i < headerElements.length; i++) {
			this.headerElement.appendChild(headerElements[i]);
		}
    }
}

/** This method shows the window. */
haxapp.ui.WindowFrame.prototype.changeParent = function(newParentContainer) {
    this.hide();
    var oldParentContainer = this.parentContainer;
    var oldParentEventManager = oldParentContainer.getEventManager();
    oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    oldParentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    
    this.parentContainer = newParentContainer;
    this.parentElement = newParentContainer.getContainerElement();
    
    var newParentEventManager = newParentContainer.getEventManager();
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    newParentEventManager.addListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.show();
}

/** This method shows the window. */
haxapp.ui.WindowFrame.prototype.show = function() {
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

/** This method hides the window. */
haxapp.ui.WindowFrame.prototype.hide = function() {
    this.parentContainer.removeWindow(this);
    if(this.isShowing) {
        this.isShowing = false;
        this.frameHidden();
    }
}

/** This method closes the window. */
haxapp.ui.WindowFrame.prototype.deleteWindow = function() {
    var parentEventManager = this.parentContainer.getEventManager();
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_SHOWN, this.onShow);
    parentEventManager.removeListener(haxapp.ui.ParentContainer.CONTENT_HIDDEN, this.onHide);
    this.hide();
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowFrame.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method returns true if the window is showing. */
haxapp.ui.WindowFrame.prototype.getContentIsShowing = function() {
    return (this.isShowing)&&(this.windowState != haxapp.ui.WindowFrame.MINIMIZED);
}

/** This method sets the position of the window frame in the parent. */
haxapp.ui.WindowFrame.prototype.setPosition = function(x,y) {
	//don't let window be placed at a negative coord. We can lose it.
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	this.coordinateInfo.x = x;
	this.coordinateInfo.y = y;
	
    this.updateCoordinates();
}

/** This method sets the size of the window frame, including the title bar. */
haxapp.ui.WindowFrame.prototype.setSize = function(width,height) {
    this.coordinateInfo.width = width;
	this.coordinateInfo.height = height;
    
    this.updateCoordinates();
}

/** This method sets the size of the window to fit the content. It should only be 
 * called after the window has been shown. The argument passed should be the element
 * that holds the content and is sized to it. */
haxapp.ui.WindowFrame.prototype.fitToContent = function(contentContainer) {
	//figure out how big to make the frame to fit the content
    var viewWidth = this.body.offsetWidth;
    var viewHeight = this.body.offsetHeight;
    var contentWidth = contentContainer.offsetWidth;
    var contentHeight = contentContainer.offsetHeight;
	
	var targetWidth = this.coordinateInfo.width + contentWidth - viewWidth + haxapp.ui.WindowFrame.FIT_WIDTH_BUFFER;
	var targetHeight = this.coordinateInfo.height + contentHeight - viewHeight + haxapp.ui.WindowFrame.FIT_HEIGHT_BUFFER;
	
    this.setSize(targetWidth,targetHeight);
}

/** This method centers the window in its parent. it should only be called
 *after the window is shown. */
haxapp.ui.WindowFrame.prototype.centerInParent = function() {
    var coords = this.parentContainer.getCenterOnPagePosition(this);
    this.setPosition(coords[0],coords[1]);
}

/** @private */
haxapp.ui.WindowFrame.FIT_HEIGHT_BUFFER = 20;
/** @private */
haxapp.ui.WindowFrame.FIT_WIDTH_BUFFER = 20;
	
/** This method gets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.getCoordinateInfo= function() {
    return this.coordinateInfo;
}

/** This method sets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.setCoordinateInfo= function(coordinateInfo) {
    this.coordinateInfo = coordinateInfo;
    this.updateCoordinates();
}

/** This method gets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.getWindowState = function() {
    return this.windowState;
}

/** This method sets the location and size info for the window. */
haxapp.ui.WindowFrame.prototype.setWindowState = function(windowState) {
    switch(windowState) {
        case haxapp.ui.WindowFrame.NORMAL:
            this.restoreContent();
            break;
            
        case haxapp.ui.WindowFrame.MINIMIZED:
            this.minimizeContent();
            break;
            
        case haxapp.ui.WindowFrame.MAXIMIZED:
            this.maximizeContent();
            break;
            
        default:
            alert("Unknown window state: " + windowState);
            break;
    }
}

/** This method returns the main dom element for the window frame. */
haxapp.ui.WindowFrame.prototype.getElement = function() {
    return this.frame;
}

/** This method returns the window body.*/
haxapp.ui.WindowFrame.prototype.getBody = function() {
    return this.body;
}

/** This method returns the window body.*/
haxapp.ui.WindowFrame.prototype.getParent = function() {
    return this.parentContainer;
}

/** This method sets a content element in the body. Alternatively the body can 
 * be retrieved and loaded as desired. */
haxapp.ui.WindowFrame.prototype.setContent = function(element) {
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

/** This method sets the size of the window, including the title bar and other decorations. */
haxapp.ui.WindowFrame.prototype.setZIndex = function(zIndex) {
    this.frame.style.zIndex = String(zIndex);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.addTitleBarElement = function(element) {
    this.titleBarLeftElements.appendChild(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.removeTitleBarElement = function(element) {
    this.titleBarLeftElements.appendRemove(element);
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.addRightTitleBarElement = function(element) {
    if(this.titleBarRightElements.firstChild) {
		this.titleBarRightElements.insertBefore(element,this.titleBarRightElements.firstChild);
	}
    else {
        this.titleBarRightElements.appendChild(element);
    }
}

/** This method sets the content for the body. To clear the content, pass null.*/
haxapp.ui.WindowFrame.prototype.removeRightTitleBarElement = function(element) {
    this.titleBarRightElements.appendRemove(element);
}

//====================================
// Motion/Reseize Event Handlers and functions
//====================================

/** Mouse down handler for moving the window. */
haxapp.ui.WindowFrame.prototype.moveMouseDown = function(e) {
    //do not do move in maximized state
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) return;
    
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
haxapp.ui.WindowFrame.prototype.moveMouseMove = function(e) {
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
haxapp.ui.WindowFrame.prototype.moveMouseUp = function(e) {
    this.endMove();
}

/** Mouse leave handler for moving the window. */
haxapp.ui.WindowFrame.prototype.moveMouseLeave = function(e) {
    this.endMove();
}

/** Mouse down handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseDown = function(e,resizeFlags) {
    //do not do resize in maximized state
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) return;

	if(resizeFlags) {
		if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_EAST) {
			this.resizeEastActive = true;
			this.resizeOffsetWidth = e.clientX - this.frame.clientWidth;
		}
		else if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_WEST) {
			this.resizeWestActive = true;
			this.resizeOffsetWidth = e.clientX + this.frame.clientWidth;
			this.moveOffsetX = e.clientX - this.frame.offsetLeft;
		}
		if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_SOUTH) {
			this.resizeSouthActive = true;
			this.resizeOffsetHeight = e.clientY - this.frame.clientHeight;
		}
		else if(resizeFlags & haxapp.ui.WindowFrame.RESIZE_NORTH) {
			this.resizeNorthActive = true;
			this.resizeOffsetHeight = e.clientY + this.frame.clientHeight;
			this.moveOffsetY = e.clientY - this.frame.offsetTop;
		}

        //add resize events to the parent, since the mouse can leave this element during a move
		this.parentElement.addEventListener("mouseup",this.resizeOnMouseUp);
		this.parentElement.addEventListener("mousemove",this.resizeOnMouseMove);
        this.parentElement.addEventListener("mouseleave",this.resizeOnMouseLeave);
	}
}

/** Mouse move handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseMove = function(e) {
    var newHeight;
    var newWidth;
    var newX;
    var newY;
    var changeMade = false;
    
	if(this.resizeEastActive) {
		newWidth = e.clientX - this.resizeOffsetWidth;
		if(newWidth < this.minWidth) return;
        this.coordinateInfo.width = newWidth;
        changeMade = true;
	}
	else if(this.resizeWestActive) {
		newWidth = this.resizeOffsetWidth - e.clientX;
		if(newWidth < this.minWidth) return;
		newX = e.clientX - this.moveOffsetX;
		if(newX < 0) newX = 0;
        this.coordinateInfo.width = newWidth;
        this.coordinateInfo.x = newX;
        changeMade = true;
	}
	if(this.resizeSouthActive) {
		newHeight = e.clientY - this.resizeOffsetHeight;
		if(newHeight < this.minHeight) return;
		this.coordinateInfo.height = newHeight;
        changeMade = true;
	}
	else if(this.resizeNorthActive) {
		newHeight = this.resizeOffsetHeight - e.clientY;
		if(newHeight < this.minHeight) return;
		newY = e.clientY - this.moveOffsetY;
		if(newY < 0) newY = 0;
		this.coordinateInfo.height = newHeight;
		this.coordinateInfo.y = newY;
        changeMade = true;
	}
        
    if(changeMade) {
        //update coordinates
        this.updateCoordinates();
    }
}

/** Mouse up handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseUp = function(e) {
    this.endResize();
}

/** Mouse up handler for resizing the window. */
haxapp.ui.WindowFrame.prototype.resizeMouseLeave = function(e) {
    this.endResize();
}


/** This method ends a move action. 
 * @private */
haxapp.ui.WindowFrame.prototype.endMove = function(e) {
    this.windowDragActive = false;
    this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
    this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
}

/** this method ends a resize action.
 * @private */
haxapp.ui.WindowFrame.prototype.endResize = function() {
	this.resizeEastActive = false;
	this.resizeWestActive = false;
	this.resizeSouthActive = false;
	this.resizeNorthActive = false;
	this.parentElement.removeEventListener("mouseup",this.resizeOnMouseUp);
	this.parentElement.removeEventListener("mousemove",this.resizeOnMouseMove);
}

//====================================
//  Min/max Methods
//====================================

/** This is the minimize function for the window.*/
haxapp.ui.WindowFrame.prototype.minimizeContent = function() {
    
    //set body as hidden
    this.body.style.display = "none";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === haxapp.ui.WindowFrame.MAXIMIZED);
 
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.MINIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    //dispatch resize event
    if(!wasMinimized) this.contentOnlyHidden();
}

/** This is the restore function for the window.*/
haxapp.ui.WindowFrame.prototype.restoreContent = function() {
    
    //set body as not hidden
    this.body.style.display = "";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    var wasMaximized = (this.windowState === haxapp.ui.WindowFrame.MAXIMIZED);
    
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.NORMAL;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
}

/** This is the minimize function for the window.*/
haxapp.ui.WindowFrame.prototype.maximizeContent = function() {
    
    //set body as not hidden
    this.body.style.display = "";
    
    var wasMinimized = (this.windowState === haxapp.ui.WindowFrame.MINIMIZED);
    
    //set the window state
    this.windowState = haxapp.ui.WindowFrame.MAXIMIZED;
    this.updateCoordinates();
    this.setMinMaxButtons();
    
    if(wasMinimized) this.contentOnlyShown();
}


/** This method ends a move action. 
 * @private */
haxapp.ui.WindowFrame.prototype.setMinMaxButtons = function() {
    if(this.minimizeButton) {
        if(this.windowState == haxapp.ui.WindowFrame.MINIMIZED) {
            this.minimizeButton.style.display = "none";
        }
        else {
            this.minimizeButton.style.display = "";
        }
    }
    if(this.restoreButton) {
        if(this.windowState == haxapp.ui.WindowFrame.NORMAL) {
            this.restoreButton.style.display = "none";
        }
        else {
            this.restoreButton.style.display = "";
        }
    }
    if(this.maximizeButton) {
        if(this.windowState == haxapp.ui.WindowFrame.MAXIMIZED) {
            this.maximizeButton.style.display = "none";
        }
        else {
            this.maximizeButton.style.display = "";
        }
    }
}

/** @private */
haxapp.ui.WindowFrame.prototype.updateCoordinates = function() {
	
    if(this.windowState === haxapp.ui.WindowFrame.MAXIMIZED) {
        //apply the maximized coordinates size
        this.frame.style.left = "0px";
		this.frame.style.top = "0px";
		this.frame.style.height = "100%";
		this.frame.style.width = "100%";
    }
    else if(this.windowState === haxapp.ui.WindowFrame.NORMAL) {
        //apply the normal size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		if(this.coordinateInfo.height !== undefined) {
			this.frame.style.height = this.coordinateInfo.height + "px";
		}
		else {
			this.frame.style.height = haxapp.ui.WindowFrame.DEFAULT_WINDOW_HEIGHT + "px";
		}
		if(this.coordinateInfo.width !== undefined) {
			this.frame.style.width = this.coordinateInfo.width + "px";
		}
		else {
			this.frame.style.width = haxapp.ui.WindowFrame.DEFAULT_WINDOW_WIDTH + "px";
		}
    }
    else if(this.windowState === haxapp.ui.WindowFrame.MINIMIZED) {
        //apply the minimized size to the window
		this.frame.style.left = this.coordinateInfo.x + "px";
        this.frame.style.top = this.coordinateInfo.y + "px";
		
		this.frame.style.height = "0px";
		this.frame.style.width = "0px";
    }
}

/** This method should be called when the entire window is shown.
 * @private */
haxapp.ui.WindowFrame.prototype.frameShown = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method should be called when the entire window is hidden.
 * @private */
haxapp.ui.WindowFrame.prototype.frameHidden = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}

/** This method should be called when the entire window is hidden
 * @private */
haxapp.ui.WindowFrame.prototype.contentOnlyShown = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_SHOWN,this);
}

/** This method shoudl be called when the window contents are show
 * @private */
haxapp.ui.WindowFrame.prototype.contentOnlyHidden = function() {
    
    //dispatch event
    this.dispatchEvent(haxapp.ui.ParentContainer.CONTENT_HIDDEN,this);
}

//====================================
// Initialization Methods
//====================================

/** @private */
haxapp.ui.WindowFrame.prototype.initUI = function() {
    
    var table;
    var row;
    var cell;
    
    table = document.createElement("table");
    table.className = "visiui_win_main";
    this.frame = table; 
    
    //top border
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_topLeft";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST | haxapp.ui.WindowFrame.RESIZE_NORTH);
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_top";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_topRight";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST | haxapp.ui.WindowFrame.RESIZE_NORTH);  
    row.appendChild(cell);
    
    //title bar
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_left";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass;
    this.titleBarCell = cell;
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_right";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST); 
    cell.rowSpan = 3;
    row.appendChild(cell);
    
    //header row
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_headerCell";
    this.headerCell = cell;
    row.appendChild(cell);
    
    //body
    row = document.createElement("tr");
    row.className = "visiui_win_bodyRow";
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = "visiui_win_bodyCell";
    this.bodyCell = cell;
    row.appendChild(cell);
    
    //bottom border
    row = document.createElement("tr");
    table.appendChild(row);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_bottomLeft";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_WEST | haxapp.ui.WindowFrame.RESIZE_SOUTH); 
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_bottom";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_SOUTH);  
    row.appendChild(cell);
    cell = document.createElement("td");
    cell.className = this.options.frameColorClass + " visiui_win_bottomRight";
    this.addResizeHandlers(cell,haxapp.ui.WindowFrame.RESIZE_EAST | haxapp.ui.WindowFrame.RESIZE_SOUTH);
    row.appendChild(cell);
    
    this.createTitleBar();
    this.createHeaderContainer();
    this.createBody();
}

/** @private */
haxapp.ui.WindowFrame.prototype.addResizeHandlers = function(cell,flags) {
    //add handlers if the window is resizable
    if(this.options.resizable) {
        var instance = this;
        cell.onmousedown = function(event) {
            instance.resizeMouseDown(event,flags);
        }
        
        //these are not cel specific. they are used on all cells and on the parent container
        //during a move.
        if(!this.resizeOnMouseMove) {
            this.resizeOnMouseMove = function(event) {
                instance.resizeMouseMove(event);
            };
            this.resizeOnMouseUp = function(event) {
                instance.resizeMouseUp(event);
            };
            this.resizeOnMouseLeave = function(event) {
                instance.resizeMouseLeave(event);
            };
        }
    }
}

/** @private */
haxapp.ui.WindowFrame.prototype.createTitleBar = function() {
    
    this.titleBar = document.createElement("div");
    this.titleBar.className = this.options.titleBarClass;

    //add elements
    this.titleBarLeftElements = document.createElement("div");
    haxapp.ui.applyStyle(this.titleBarLeftElements,haxapp.ui.WindowFrame.TITLE_BAR_LEFT_STYLE);
    this.titleBar.appendChild(this.titleBarLeftElements);


    this.titleBarRightElements = document.createElement("div");
    haxapp.ui.applyStyle(this.titleBarRightElements,haxapp.ui.WindowFrame.TITLE_BAR_RIGHT_STYLE);
    this.titleBar.appendChild(this.titleBarRightElements);

    //for handlers below
    var instance = this;
    
    //add window commands ( we will hide the bottons that are not needed)
    //minimize button
    if(this.options.minimizable) {
        this.minimizeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.minimizeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.minimizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MINIMIZE_CMD_IMAGE);
        this.minimizeButton.onclick = function() {
            instance.minimizeContent();
        }
        this.titleBarRightElements.appendChild(this.minimizeButton);
    }
	
    //restore button - only if we cn minimize or maximize
    if(this.options.minimizable || this.options.maximizable) {	
        this.restoreButton = document.createElement("img");
        haxapp.ui.applyStyle(this.restoreButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.restoreButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.RESTORE_CMD_IMAGE);
        this.restoreButton.onclick = function() {
            instance.restoreContent();
        }
        this.titleBarRightElements.appendChild(this.restoreButton);
    }
    
    //maximize button and logic
    if(this.options.maximizable) {
        this.maximizeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.maximizeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.maximizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.MAXIMIZE_CMD_IMAGE);
        this.maximizeButton.onclick = function() {
            instance.maximizeContent();
        }
        this.titleBarRightElements.appendChild(this.maximizeButton);
    }
    
    //layout the window buttons
    this.windowState = haxapp.ui.WindowFrame.NORMAL;
    this.setMinMaxButtons();
    
    //close button
    if(this.options.closable) {
        this.closeButton = document.createElement("img");
        haxapp.ui.applyStyle(this.closeButton,haxapp.ui.WindowFrame.COMMAND_BUTTON_STYLE);
        this.closeButton.src = haxapp.ui.getResourcePath(haxapp.ui.WindowFrame.CLOSE_CMD_IMAGE);
        this.closeButton.onclick = function() {
            instance.hide();
        }
        this.titleBarRightElements.appendChild(this.closeButton);
    }
	
	//add am empty title
	this.setTitle("");
    
    //mouse move and resize
    if(this.options.movable) {
        //add mouse handlers for moving the window 
        this.titleBar.onmousedown = function(event) {
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
    
    //add to window
    this.titleBarCell.appendChild(this.titleBar);
}

/** @private */
haxapp.ui.WindowFrame.prototype.createHeaderContainer = function() {
    
    this.headerElement = document.createElement("div");
    this.headerElement.className = "visiui_win_header";
    
    this.headerCell.appendChild(this.headerElement);
 
    //load empty headers
    this.loadHeaders([]);
}
	
/** @private */
haxapp.ui.WindowFrame.prototype.createBody = function() {
    
    this.body = document.createElement("div");
    this.body.className = "visiui_win_body";
    
    this.bodyCell.appendChild(this.body);
}
