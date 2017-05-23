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
    var instance = this;
    this.domElement.onmousedown = function(e) {
        haxapp.ui.Menu.menuHeaderPressed(instance);
		e.stopPropagation();
    }	
}

