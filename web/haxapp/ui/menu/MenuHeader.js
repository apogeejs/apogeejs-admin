/** This is a menu component, attached to the given dom element
 *
 * @class 
 */
haxapp.ui.MenuHeader = function(domElement) {
	
	//initialize menus, if needed
	if(!haxapp.ui.Menu.initialized) {
		haxapp.ui.Menu.initialize();
	}
	
    //variables
    this.domElement = domElement;
    this.menuBody = new haxapp.ui.MenuBody();
	
    //construct the menu
	this.initHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHeader(this);
}

//style info
haxapp.ui.MenuHeader.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "border":"",
    "backgroundColor":"",
    "padding":"2px"
}
haxapp.ui.MenuHeader.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "backgroundColor":"lightgray",
    "padding":"2px"
}

/** this returns the dom element for the menu heading. */
haxapp.ui.MenuHeader.prototype.getElement = function() {
    return this.domElement;
}

/** this returns the dom element for the menu object. */
haxapp.ui.MenuHeader.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.removeMenuItem = function(title) {
	this.menuBody.removeMenuItem(title);
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.initHeadingElement = function() {
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_BASE_STYLE);
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
	
    var instance = this;
    this.domElement.onmousedown = function(e) {
        haxapp.ui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }	
	
    this.domElement.onmouseenter = function(e) {
		haxapp.ui.applyStyle(instance.domElement,haxapp.ui.MenuHeader.MENU_HEADING_HOVER_STYLE);
        haxapp.ui.Menu.menuHeaderEntered(instance);
    }
	this.domElement.onmouseleave = function(e) {
        haxapp.ui.applyStyle(instance.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuHeader.prototype.restoreNormalAppearance = function() {
    haxapp.ui.applyStyle(this.domElement,haxapp.ui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
}
