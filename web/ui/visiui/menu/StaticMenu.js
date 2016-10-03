/** This is a menu component, attached to the given dom element
 *
 * @class 
 */
hax.visiui.MenuHeader = function(domElement) {
	
	//initialize menus, if needed
	if(!hax.visiui.Menu.initialized) {
		hax.visiui.Menu.initialize();
	}
	
    //variables
    this.domElement = domElement;
    this.menuBody = new hax.visiui.MenuBody();
	
    //construct the menu
	this.initHeadingElement();
    
    //attach menu to heading
    this.menuBody.attachToMenuHeader(this);
}

//style info
hax.visiui.MenuHeader.MENU_HEADING_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "position":"relative",
    "cursor":" default",
	"overflow":"visible"
}
hax.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE = {
    //configurable
    "border":"",
    "backgroundColor":"",
    "padding":"2px"
}
hax.visiui.MenuHeader.MENU_HEADING_HOVER_STYLE = {
    //configurable
    "backgroundColor":"lightgray",
    "padding":"2px"
}

/** this returns the dom element for the menu heading. */
hax.visiui.MenuHeader.prototype.getElement = function() {
    return this.domElement;
}

/** this returns the dom element for the menu object. */
hax.visiui.MenuHeader.prototype.getMenuBody = function() {
    return this.menuBody;
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.addCallbackMenuItem = function(title, callback) {
    this.menuBody.addCallbackMenuItem(title,callback);
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.addMenuItem = function(itemInfo) {
    this.menuBody.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.setMenuItems = function(itemInfos) {
    this.menuBody.setMenuItems(itemInfos);
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.removeMenuItem = function(title) {
	this.menuBody.removeMenuItem(title);
}

//================================
// Init
//================================

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.initHeadingElement = function() {
    hax.visiui.applyStyle(this.domElement,hax.visiui.MenuHeader.MENU_HEADING_BASE_STYLE);
    hax.visiui.applyStyle(this.domElement,hax.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
	
    var instance = this;
    this.domElement.onmousedown = function(e) {
        hax.visiui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }	
	
    this.domElement.onmouseenter = function(e) {
		hax.visiui.applyStyle(instance.domElement,hax.visiui.MenuHeader.MENU_HEADING_HOVER_STYLE);
        hax.visiui.Menu.menuHeaderEntered(instance);
    }
	this.domElement.onmouseleave = function(e) {
        hax.visiui.applyStyle(instance.domElement,hax.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
hax.visiui.MenuHeader.prototype.restoreNormalAppearance = function() {
    hax.visiui.applyStyle(this.domElement,hax.visiui.MenuHeader.MENU_HEADING_NORMAL_STYLE);
}
