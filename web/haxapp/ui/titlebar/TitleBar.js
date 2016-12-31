
haxapp.ui.TitleBar = function(eventManager,commandFlags) {
    
    this.menu = null;
 
    this.titleBarElement = haxapp.ui.createElementWithClass("div","visiui_win_titleBarClass");
    this.titleBarLeftElements = haxapp.ui.createElementWithClass("div","visiui_tb_left_style",this.titleBarElement);
    this.titleBarRightElements = haxapp.ui.createElementWithClass("div","visiui_tb_right_style",this.titleBarElement);

    //for handlers below
    var instance = this;
    
    //add window commands ( we will hide the bottons that are not needed)
    //minimize button
    if(commandFlags & haxapp.ui.MINIMIZABLE) {
        this.minimizeButton = haxapp.ui.createElementWithClass("img","visiui_tb_cmd_button",this.titleBarRightElements);
        this.minimizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.TitleBar.MINIMIZE_CMD_IMAGE);
        this.minimizeButton.onclick = function() {
            eventManager.dispatchEvent("minimize_request",instance);
        };
    }
	
    //restore button - only if we cn minimize or maximize
    if(commandFlags & (haxapp.ui.MINIMIZABLE |  haxapp.ui.MAXIMIZABLE)) {	
        this.restoreButton = haxapp.ui.createElementWithClass("img","visiui_tb_cmd_button",this.titleBarRightElements);
        this.restoreButton.src = haxapp.ui.getResourcePath(haxapp.ui.TitleBar.RESTORE_CMD_IMAGE);
        this.restoreButton.onclick = function() {
            eventManager.dispatchEvent("restore_request",instance);
        };
    }
    
    //maximize button and logic
    if(commandFlags & haxapp.ui.MAXIMIZABLE) {
        this.maximizeButton = haxapp.ui.createElementWithClass("img","visiui_tb_cmd_button",this.titleBarRightElements);
        this.maximizeButton.src = haxapp.ui.getResourcePath(haxapp.ui.TitleBar.MAXIMIZE_CMD_IMAGE);
        this.maximizeButton.onclick = function() {
            eventManager.dispatchEvent("maximize_request",instance);
        };
    }
    
    //close button
    if(commandFlags & haxapp.ui.CLOSEABLE) {
        this.closeButton = haxapp.ui.createElementWithClass("img","visiui_tb_cmd_button",this.titleBarRightElements);
        this.closeButton.src = haxapp.ui.getResourcePath(haxapp.ui.TitleBar.CLOSE_CMD_IMAGE);
        this.closeButton.onclick = function() {
            eventManager.dispatchEvent("close_request",instance);
        };
    }
	
	//set initialValues
    this.setMinMaxButtons(haxapp.ui.WINDOW_STATE_NORMAL);
	this.setTitle("");
   
}

haxapp.ui.TitleBar.MINIMIZE_CMD_IMAGE = "/minimize.png";
haxapp.ui.TitleBar.RESTORE_CMD_IMAGE = "/restore.png";
haxapp.ui.TitleBar.MAXIMIZE_CMD_IMAGE = "/maximize.png";
haxapp.ui.TitleBar.CLOSE_CMD_IMAGE = "/close.png";
haxapp.ui.TitleBar.MENU_IMAGE = "/hamburger.png";

haxapp.ui.TitleBar.prototype.getOuterElement = function() {
    return this.titleBarElement;
}

haxapp.ui.TitleBar.prototype.getTitle = function(title) {
    return this.title;
}

/** This method sets the title on the window frame.
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is immediately after the menu, if the menu is present. */
haxapp.ui.TitleBar.prototype.setTitle = function(title) {
	if((title === null)||(title === undefined)||(title.length === 0)) {
		title = "&nbsp;";
	}
    //title
    this.title = title;
    if(!this.titleElement) {
        this.titleElement = haxapp.ui.createElementWithClass("div","visiui_tb_title",this.titleBarLeftElements);
    }
    this.titleElement.innerHTML = title;
    
}

/** This gets the menu for the window frame. If this is called, a menu will be added
 * to the window frame, empty or otherwise. If it is not called, there will be no menu. 
 * This will be added to the title bar in the order it was called. The standard
 * location for the menu is first. */
haxapp.ui.TitleBar.prototype.getMenu = function() {
    if(!this.menu) {
        this.menu = haxapp.ui.Menu.createMenuFromImage(haxapp.ui.getResourcePath(haxapp.ui.TitleBar.MENU_IMAGE));
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

/** This method ends a move action. 
 * @private */
haxapp.ui.TitleBar.prototype.setMinMaxButtons = function(elementState) {
    if(this.minimizeButton) {
        if(this.windowState == haxapp.ui.WINDOW_STATE_MINIMIZED) {
            this.minimizeButton.style.display = "none";
        }
        else {
            this.minimizeButton.style.display = "";
        }
    }
    if(this.restoreButton) {
        if(this.windowState == haxapp.ui.WINDOW_STATE_NORMAL) {
            this.restoreButton.style.display = "none";
        }
        else {
            this.restoreButton.style.display = "";
        }
    }
    if(this.maximizeButton) {
        if(this.windowState == haxapp.ui.WINDOW_STATE_MAXIMIZED) {
            this.maximizeButton.style.display = "none";
        }
        else {
            this.maximizeButton.style.display = "";
        }
    }
}