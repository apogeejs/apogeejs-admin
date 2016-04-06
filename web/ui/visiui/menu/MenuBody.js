/** This is a menu component
 *
 * @class 
 */
visicomp.visiui.MenuBody = function() {
	
	//initialize menus, if needed
	if(!visicomp.visiui.Menu.initialized) {
		visicomp.visiui.Menu.initialize();
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

//style info
visicomp.visiui.MenuBody.MENU_STYLE = {
    //fixed
    "overflow":"visible",
    "position":"absolute",
    "top":"100%",
    "left":"0%",
    "zIndex":"100",
    
    //configurable
    "border":"1px solid lightgray",
    "background-color":"white"
}
visicomp.visiui.MenuBody.MENU_ITEM_BASE_STYLE = {
    //fixed
    "cursor":"default",
    "display":"table"
}
visicomp.visiui.MenuBody.MENU_ITEM_NORMAL_STYLE = {
    //configurable
    "background-color":"",
    "padding":"2px"
}
visicomp.visiui.MenuBody.MENU_ITEM_HOVER_STYLE = {
    //configurable
    "background-color":"lightgray",
    "padding":"2px"
}

/** This method replaces on spaces with &nbsp; spaces. It is intedned to prevent
 * wrapping in html. */
visicomp.visiui.MenuBody.convertSpacesForHtml = function(text) {
    return text.replace(/ /g,"&nbsp;");
}


/** this returns the dom element for the menu object. */
visicomp.visiui.MenuBody.prototype.getMenuElement = function() {
    return this.menuDiv;
}

/** This returns the parent element for the menu.  */
visicomp.visiui.MenuBody.prototype.getParentElement = function() {
    return this.parentElement;
}

/** This returns the parent element for the menu.  */
visicomp.visiui.MenuBody.prototype.getMenuHeader = function() {
    return this.menuHeader;
}

/** This returns the parent element for the menu.  */
visicomp.visiui.MenuBody.prototype.getIsContext = function() {
    return (this.menuHeader == null);
}

/** This method is used to attach the menu to the menu head, in a static menu. */
visicomp.visiui.MenuBody.prototype.attachToMenuHeader = function(menuHeader) {
    //attach menu to heading
    this.parentElement = menuHeader.getElement();
    this.menuDiv.style.left = "0%";
    this.menuDiv.style.top = "100%";
    
    this.menuHeader = menuHeader;
}

/** This method is used to set the position for a context menu. The x and y coordinates
 * should be the coordinates in the parent element. It is recommended to use the 
 * document body. */
visicomp.visiui.MenuBody.prototype.setPosition = function(x, y, parentElement) {
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
visicomp.visiui.MenuBody.prototype.addEventMenuItem = function(title, eventName, eventData, eventManager) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.eventName = eventName;
    itemInfo.eventData = eventData;
    itemInfo.eventManager = eventManager;
    this.addMenuItem(itemInfo);
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuBody.prototype.addCallbackMenuItem = function(title, callback) {
    var itemInfo = {};
    itemInfo.title = title;
    itemInfo.callback = callback;
    this.addMenuItem(itemInfo);
}
    
/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuBody.prototype.addMenuItem = function(itemInfo) {
    itemInfo.element = document.createElement("div");
    visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    
    var title = visicomp.visiui.MenuBody.convertSpacesForHtml(itemInfo.title);
    itemInfo.element.innerHTML = title;
	
    itemInfo.element.onmousedown = function(event) {
		event.stopPropagation();
    }
	itemInfo.element.onmouseup = function(event) {
		//close menu
		visicomp.visiui.Menu.hideActiveMenu();
        
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
        visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    }
	itemInfo.element.onmousemove= function(e) {
        e.preventDefault();
    }
	//css hover did not work with drag
	itemInfo.element.onmouseenter= function(e) {
        visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.MenuBody.MENU_ITEM_HOVER_STYLE);
    }
	itemInfo.element.onmouseleave= function(e) {
        visicomp.visiui.applyStyle(itemInfo.element,visicomp.visiui.MenuBody.MENU_ITEM_NORMAL_STYLE);
    }
	
    this.menuDiv.appendChild(itemInfo.element);
    this.menuItems[itemInfo.title] = itemInfo;
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuBody.prototype.setMenuItems = function(itemInfos) {
    for(var i = 0; i < itemInfos.length; i++) {
        this.addMenuItem(itemInfos[i]);
    }
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuBody.prototype.removeMenuItem = function(title) {
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
visicomp.visiui.MenuBody.prototype.createMenuElement = function() {
    this.menuDiv = document.createElement("div");

    //style like a normal manu
    visicomp.visiui.applyStyle(this.menuDiv,visicomp.visiui.MenuBody.MENU_STYLE);
}
