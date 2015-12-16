/** This is a menu component, attached to the given dom element
 *
 * @class 
 */
visicomp.visiui.MenuHeader = function(domElement) {
	
	//initialize menus, if needed
	if(!visicomp.visiui.Menu.initialized) {
		visicomp.visiui.Menu.initialize();
	}
	
    //variables
    this.domElement = domElement;
    this.menuBody = new visicomp.visiui.MenuBody();
	
    //construct the menu
	this.initHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHeader(this);
}

//style info
visicomp.visiui.MenuHeader.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
visicomp.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "border":"",
    "background-color":"",
    "padding":"2px"
}
visicomp.visiui.MenuHeader.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "background-color":"lightgray",
    "padding":"2px"
}

/** this returns the dom element for the menu heading. */
visicomp.visiui.MenuHeader.prototype.getElement = function() {
    return this.domElement;
}

/** this returns the dom element for the menu object. */
visicomp.visiui.MenuHeader.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.initHeadingElement = function() {
    visicomp.visiui.applyStyle(this.domElement,visicomp.visiui.MenuHeader.MENU_HEADING_BASE_STYLE);
    visicomp.visiui.applyStyle(this.domElement,visicomp.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
	
    var instance = this;
    this.domElement.onmousedown = function(e) {
        visicomp.visiui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }
    this.domElement.onmouseenter = function(e) {
		visicomp.visiui.applyStyle(instance.domElement,visicomp.visiui.MenuHeader.MENU_HEADING_HOVER_STYLE);
        visicomp.visiui.Menu.menuHeaderEntered(instance);
    }
	this.domElement.onmouseleave = function(e) {
        visicomp.visiui.applyStyle(instance.domElement,visicomp.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
    }
	this.domElement.onmousemove = function(e) {
        e.preventDefault();
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuHeader.prototype.restoreNormalAppearance = function() {
    visicomp.visiui.applyStyle(this.domElement,visicomp.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
}
