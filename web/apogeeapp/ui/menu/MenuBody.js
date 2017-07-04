/** This is a menu component
 *
 * @class 
 */
apogeeapp.ui.MenuBody = function() {
	
	//initialize menus, if needed
	if(!apogeeapp.ui.Menu.initialized) {
		apogeeapp.ui.Menu.initialize();
	}
	
    //variables
    this.menuDiv = null;
    this.parentElement = null;
	
    this.menuItems = {};
	
    //construct the menu
    this.createMenuElement();
    
    //this will be set if it is a static menu
    this.menuHeader = null;
}

/** this returns the dom element for the menu object. */
apogeeapp.ui.MenuBody.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getParentElement = function() {
    return this.parentElement;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getMenuHeader = function() {
    return this.menuHeader;
}

/** This returns the parent element for the menu.  */
apogeeapp.ui.MenuBody.prototype.getIsContext = function() {
    return (this.menuHeader == null);
}

/** This is called before the menu body is shown */
apogeeapp.ui.MenuBody.prototype.prepareShow = function() {
    if(this.isOnTheFlyMenu) {
        this.constructItemsForShow();
    }
}

/** This is called after the menu body is hidden. */
apogeeapp.ui.MenuBody.prototype.menuHidden = function() {
    if(this.isOnTheFlyMenu) {
        this.destroyItemsForHides();
    }
}

/** This method is used to attach the menu to the menu head, in a static menu. */
apogeeapp.ui.MenuBody.prototype.attachToMenuHeader = function(menuHeader) {
    //attach menu to heading
    this.parentElement = menuHeader.getElement();
    this.menuDiv.style.left = "0%";
    this.menuDiv.style.top = "100%";
    this.menuHeader = menuHeader;
}

/** This method is used to set the position for a context menu. The x and y coordinates
 * should be the coordinates in the parent element. It is recommended to use the 
 * document body. */
apogeeapp.ui.MenuBody.prototype.setPosition = function(x, y, parentElement) {
    this.parentElement = parentElement;
   
//we need to calculate the size, so I add and remove it - there is probably another way
parentElement.appendChild(this.menuDiv);
    var parentWidth = parentElement.offsetWidth;
    var parentHeight = parentElement.offsetHeight;
    var menuWidth = this.menuDiv.clientWidth;
    var menuHeight = this.menuDiv.clientHeight;
parentElement.appendChild(this.menuDiv);

    //position
    if((x + menuWidth > parentWidth)&&(x > parentWidth/2)) {
        this.menuDiv.style.left = (x - menuWidth) + "px";
    }
    else {
        this.menuDiv.style.left = x + "px";
    }
    if((y + menuHeight > parentHeight)&&(y > parentHeight/2)) {
        this.menuDiv.style.top = (y - menuHeight) + "px";
    }
    else {
        this.menuDiv.style.top = y + "px";
    }
}

/** This sets a callback to create the menu when the menu is opened. This is
 * for static menus where we do not want to populate it ahead of time. */
apogeeapp.ui.MenuBody.prototype.setAsOnTheFlyMenu = function(menuItemsCallback) {
	this.isOnTheFlyMenu = true;
    this.menuItemsCallback = menuItemsCallback;
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.eventData = eventData;
    itemInfo.eventManager = eventManager;
    this.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addCallbackMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
    this.addMenuItem(itemInfo);
}
    
/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.addMenuItem = function(itemInfo) {
    itemInfo.element = apogeeapp.ui.createElementWithClass("div","visiui-menu-item");
    itemInfo.element.innerHTML = itemInfo.title;
    
    if(itemInfo.childMenuItems) {
        //create a parent menu item
        var childMenuBody = this.createChildMenuBody(itemInfo.childMenuItems);
        var childMenuDiv = childMenuBody.getMenuElement();
        childMenuDiv.style.left = "100%";
        childMenuDiv.style.top = "0%";
        itemInfo.element.appendChild(childMenuDiv);
    }
    else {
        //create a norman (clickable) menu item
        itemInfo.element.onmousedown = function(event) {
            event.stopPropagation();
        }
        itemInfo.element.onclick = function(event) {
            //close menu
            apogeeapp.ui.Menu.hideActiveMenu();

            //do menu action
            if(itemInfo.eventName) {
                //dispatch event
                itemInfo.eventManager.dispatchEvent(itemInfo.eventName,itemInfo.eventData);
            }
            else if(itemInfo.callback) {
                //use the callback
                itemInfo.callback();
            }
            event.stopPropagation();
        }
    }
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[itemInfo.title] = itemInfo;
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.setMenuItems = function(itemInfos) {
    for(var i = 0; i < itemInfos.length; i++) {
        this.addMenuItem(itemInfos[i]);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
apogeeapp.ui.MenuBody.prototype.removeMenuItem = function(title) {
    var itemInfo = this.menuItems[title];
    if(itemInfo) {
        this.menuDiv.removeChild(itemInfo.element);
        delete this.menuItems[title];
    }
}

//================================
// Internal
//================================

/** This method creates the menu body that is shown below the header. */
apogeeapp.ui.MenuBody.prototype.createMenuElement = function() {
    this.menuDiv = apogeeapp.ui.createElementWithClass("div","visiui-menu-body");
}

apogeeapp.ui.MenuBody.prototype.constructItemsForShow = function () {
    if(this.menuItemsCallback) {
        var menuItems = this.menuItemsCallback();
        this.setMenuItems(menuItems);
    }
}

/** This is called after the menu body is hidden. */
apogeeapp.ui.MenuBody.prototype.destroyItemsForHides = function() {
    if(this.menuDiv) {
        apogeeapp.ui.removeAllChildren(this.menuDiv);
    }
    this.menuItems = {};
}

apogeeapp.ui.MenuBody.prototype.createChildMenuBody = function(menuItems) {
    var childMenuBody = new apogeeapp.ui.MenuBody();
    childMenuBody.setMenuItems(menuItems);
    return childMenuBody;
}