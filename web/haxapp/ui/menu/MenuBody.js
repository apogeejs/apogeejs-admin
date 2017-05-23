/** This is a menu component
 *
 * @class 
 */
haxapp.ui.MenuBody = function() {
	
	//initialize menus, if needed
	if(!haxapp.ui.Menu.initialized) {
		haxapp.ui.Menu.initialize();
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

/** This method replaces on spaces with &nbsp; spaces. It is intedned to prevent
 * wrapping in html. */
haxapp.ui.MenuBody.convertSpacesForHtml = function(text) {
    return text.replace(/ /g,"&nbsp;");
}


/** this returns the dom element for the menu object. */
haxapp.ui.MenuBody.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getParentElement = function() {
    return this.parentElement;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getMenuHeader = function() {
    return this.menuHeader;
}

/** This returns the parent element for the menu.  */
haxapp.ui.MenuBody.prototype.getIsContext = function() {
    return (this.menuHeader == null);
}

/** This method is used to attach the menu to the menu head, in a static menu. */
haxapp.ui.MenuBody.prototype.attachToMenuHeader = function(menuHeader) {
    //attach menu to heading
    this.parentElement = menuHeader.getElement();
    this.menuDiv.style.left = "0%";
    this.menuDiv.style.top = "100%";
    
    this.menuHeader = menuHeader;
}

/** This method is used to set the position for a context menu. The x and y coordinates
 * should be the coordinates in the parent element. It is recommended to use the 
 * document body. */
haxapp.ui.MenuBody.prototype.setPosition = function(x, y, parentElement) {
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

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.eventData = eventData;
    itemInfo.eventManager = eventManager;
    this.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addCallbackMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
    this.addMenuItem(itemInfo);
}
    
/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.addMenuItem = function(itemInfo) {
    itemInfo.element = haxapp.ui.createElementWithClass("div","visiui-menu-item");
    
    var title = haxapp.ui.MenuBody.convertSpacesForHtml(itemInfo.title);
    itemInfo.element.innerHTML = title;
	
    itemInfo.element.onmousedown = function(event) {
		event.stopPropagation();
    }
	itemInfo.element.onmouseup = function(event) {
		//close menu
		haxapp.ui.Menu.hideActiveMenu();
        
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
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[itemInfo.title] = itemInfo;
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.setMenuItems = function(itemInfos) {
    for(var i = 0; i < itemInfos.length; i++) {
        this.addMenuItem(itemInfos[i]);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
haxapp.ui.MenuBody.prototype.removeMenuItem = function(title) {
    var itemInfo = this.menuItems[title];
    if(itemInfo) {
        this.menuDiv.removeChild(itemInfo.element);
        delete this.menuItems[title];
    }
}

//================================
// Init
//================================

/** This method creates the menu body that is shown below the header. */
haxapp.ui.MenuBody.prototype.createMenuElement = function() {
    this.menuDiv = haxapp.ui.createElementWithClass("div","visiui-menu-body");
}
