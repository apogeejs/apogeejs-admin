/** This is a menu component
 *
 * @class 
 */
visicomp.visiui.StaticMenu = function(title,eventManager) {
	
	//initialize menus, if needed
	if(!visicomp.visiui.Menu.initialized) {
		visicomp.visiui.Menu.initialize();
	}
	
    //variables
    this.eventManager = eventManager;
    this.title = title;
    this.headingDiv = null;
    this.menuBody = new visicomp.visiui.MenuBody(eventManager);
	
    //construct the menu
	this.createHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHead(this);
}

//style info
visicomp.visiui.StaticMenu.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
visicomp.visiui.StaticMenu.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "background-color":"",
    "padding":"2px"
}
visicomp.visiui.StaticMenu.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "background-color":"lightgray",
    "padding":"2px"
}

/** this returns the dom element for the menu heading. */
visicomp.visiui.StaticMenu.prototype.getHeadingElement = function() {
    return this.headingDiv;
}

/** this returns the dom element for the menu object. */
visicomp.visiui.StaticMenu.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.StaticMenu.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.StaticMenu.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.StaticMenu.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.StaticMenu.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.StaticMenu.prototype.createHeadingElement = function() {
    this.headingDiv = document.createElement("div");
    visicomp.visiui.applyStyle(this.headingDiv,visicomp.visiui.StaticMenu.MENU_HEADING_BASE_STYLE);
    visicomp.visiui.applyStyle(this.headingDiv,visicomp.visiui.StaticMenu.MENU_HEADING_NORMAL_STYLE);
    this.headingDiv.innerHTML = this.title;
	
    var instance = this;
    this.headingDiv.onmousedown = function(e) {
        visicomp.visiui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }
    this.headingDiv.onmouseenter = function(e) {
		visicomp.visiui.applyStyle(instance.headingDiv,visicomp.visiui.StaticMenu.MENU_HEADING_HOVER_STYLE);
        visicomp.visiui.Menu.menuHeaderEntered(instance);
    }
	this.headingDiv.onmouseleave = function(e) {
        visicomp.visiui.applyStyle(instance.headingDiv,visicomp.visiui.StaticMenu.MENU_HEADING_NORMAL_STYLE);
    }
	this.headingDiv.onmousemove = function(e) {
        e.preventDefault();
    }
}
