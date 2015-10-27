/** This is a menu component
 *
 * @class 
 */
visicomp.visiui.Menu = function(eventManager) {
	
	//initialize menus, if needed
	if(!visicomp.visiui.Menu.initialized) {
		visicomp.visiui.Menu.initialize();
	}
	
    //variables
    this.eventManager = eventManager;
    this.headingDiv = null;
    this.menuDiv = null;
	
    this.menuItems = {};
	
    //construct the menu
	this.createHeadingElement();
    this.createMenuElement();
}

//style info
visicomp.visiui.Menu.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
visicomp.visiui.Menu.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "background-color":"",
    "padding":"2px"
}
visicomp.visiui.Menu.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "background-color":"lightgray",
    "padding":"2px"
}
visicomp.visiui.Menu.MENU_STYLE = {
    //fixed
    "overflow":"visible",
    "position":"absolute",
    "top":"100%",
    "left":"0%",
    "z-index":"100",
    
    //configurable
    "border":"1px solid black",
    "background-color":"white"
}
visicomp.visiui.Menu.MENU_ITEM_BASE_STYLE = {
    //fixed
    "cursor":"default",
    "display":"table"
}
visicomp.visiui.Menu.MENU_ITEM_NORMAL_STYLE = {
    //configurable
    "background-color":""
}
visicomp.visiui.Menu.MENU_ITEM_HOVER_STYLE = {
    //configurable
    "background-color":"lightgray"
}


visicomp.visiui.Menu.MENU_HEADING_CLASS_NAME = "visiui_menu_heading";
visicomp.visiui.Menu.MENU_HOVER_HEADING_CLASS_NAME = "visiui_menu_heading_hover";
visicomp.visiui.Menu.MENU_CLASS_NAME = "visiui_menu";
visicomp.visiui.Menu.MENU_ITEM_CLASS_NAME = "visiui_menu_item";
visicomp.visiui.Menu.MENU_ITEM_HOVER_CLASS_NAME = "visiui_menu_item_hover";

/** this returns the dom element for the menu heading. */
visicomp.visiui.Menu.prototype.getHeadingElement = function() {
    return this.headingDiv;
}

/** this returns the dom element for the menu object. */
visicomp.visiui.Menu.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** this returns the dom element for the menu heading. */
visicomp.visiui.Menu.prototype.setTitle = function(title) {
    //set the title
	this.headingDiv.innerHTML = title;
	//re-add the menu
    this.headingDiv.appendChild(this.menuDiv);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.Menu.prototype.addMenuItem = function(title, eventName) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.element = document.createElement("div");
    visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.Menu.MENU_ITEM_NORMAL_STYLE);
    itemInfo.element.innerHTML = title;
    
    var menu = this;
	
    itemInfo.element.onmousedown = function(event) {
		event.stopPropagation();
    }
	itemInfo.element.onmouseup = function(event) {
		//close menu
		visicomp.visiui.Menu.hideActiveMenu();
		//dispatch event
        menu.eventManager.dispatchEvent(eventName);
		event.stopPropagation();
    }
	itemInfo.element.onmousemove= function(e) {
        e.preventDefault();
    }
	//css hover did not work with drag
	itemInfo.element.onmouseenter= function(e) {
        visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.Menu.MENU_ITEM_HOVER_STYLE);
    }
	itemInfo.element.onmouseleave= function(e) {
        visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.Menu.MENU_ITEM_NORMAL_STYLE);
    }
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[title] = itemInfo;
    delete this.menuItems[title];
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.Menu.prototype.removeMenuItem = function(title) {
    var itemInfo = this.menuItems[title];
    if(itemInfo) {
        this.menuDiv.removeChild(itemInfo.element);
    }
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.Menu.prototype.createHeadingElement = function() {
    this.headingDiv = document.createElement("div");
    visicomp.visiui.applyStyle(this.headingDiv,visicomp.visiui.Menu.MENU_HEADING_BASE_STYLE);
    visicomp.visiui.applyStyle(this.headingDiv,visicomp.visiui.Menu.MENU_HEADING_NORMAL_STYLE);
	
    var instance = this;
    this.headingDiv.onmousedown = function(e) {
        visicomp.visiui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }
    this.headingDiv.onmouseenter = function(e) {
		visicomp.visiui.applyStyle(instance.headingDiv,visicomp.visiui.Menu.MENU_HEADING_HOVER_STYLE);
        visicomp.visiui.Menu.menuHeaderEntered(instance);
    }
	this.headingDiv.onmouseleave = function(e) {
        visicomp.visiui.applyStyle(instance.headingDiv,visicomp.visiui.Menu.MENU_HEADING_NORMAL_STYLE);
    }
	this.headingDiv.onmousemove = function(e) {
        e.preventDefault();
    }
}

/** this method creates the menu body that is shown below the header. */
visicomp.visiui.Menu.prototype.createMenuElement = function() {
    this.menuDiv = document.createElement("div");

    //style like a normal manu
    visicomp.visiui.applyStyle(this.menuDiv,visicomp.visiui.Menu.MENU_STYLE);
    //make this a child to the heading, whicl be shown below it
    this.headingDiv.appendChild(this.menuDiv);

    this.menuDiv.style.display = "none";
}

////////////////////////////////////////////////////////////////////////////////

visicomp.visiui.Menu.initialized = false;
visicomp.visiui.Menu.activeMenu = null;

visicomp.visiui.Menu.menuHeaderPressed = function(menuObject) {
	//if there is an active menu, pressing the header closes the active menu otherwise show the menu
	if(visicomp.visiui.Menu.activeMenu) {
		//active menu - close the menu
		visicomp.visiui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		visicomp.visiui.Menu.show(menuObject);
	}
}

visicomp.visiui.Menu.menuHeaderEntered = function(menuObject) {
	//if a header is entered and there is an active menu, open this menu
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.show(menuObject);
	}
}

visicomp.visiui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

visicomp.visiui.Menu.show = function(menuObject) {
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.hideActiveMenu();
	}
	menuObject.menuDiv.style.display = "";
	visicomp.visiui.Menu.activeMenu = menuObject;
}

visicomp.visiui.Menu.hideActiveMenu = function() {
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.activeMenu.menuDiv.style.display = "none";
		visicomp.visiui.Menu.activeMenu = null;
	}
}

visicomp.visiui.Menu.nonMenuMouseHandler = null;

visicomp.visiui.Menu.initialize = function() {
	window.addEventListener("mousedown",visicomp.visiui.Menu.nonMenuPressed);
	visicomp.visiui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
visicomp.visiui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",visicomp.visiui.Menu.nonMenuPressed);
	visicomp.visiui.Menu.initialized = false;
}
	