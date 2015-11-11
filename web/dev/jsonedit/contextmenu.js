/** This is a menu component
 *
 * @class 
 */
ContextMenu = function() {
	
    this.menuDiv = null;
//    this.x = x;
//    this.y = y;
//    this.container = container;
	
    this.menuItems = {};
	
    //construct the menu
    this.createMenuElement();
}

//style info
visicomp.visiui.Menu.MENU_STYLE = {
    //fixed
    "overflow":"visible",
    "position":"absolute",
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


visicomp.visiui.Menu.MENU_CLASS_NAME = "visiui_menu";
visicomp.visiui.Menu.MENU_ITEM_CLASS_NAME = "visiui_menu_item";
visicomp.visiui.Menu.MENU_ITEM_HOVER_CLASS_NAME = "visiui_menu_item_hover";

/** this returns the dom element for the menu object. */
visicomp.visiui.Menu.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.Menu.prototype.addMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
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
        itemInfo.callback();
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

	