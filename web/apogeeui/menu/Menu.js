import uiutil from "/apogeeui/uiutil.js";

/** Thiis is a namespace with functions to control menu operation
 *
 * NOTE - the name Menu should probably be menu because this
 * is just a namespace and not a class, however when I converted this from a namespace
 * qualified by apogeeui, I didn't want to collide with local variables which are
 * often named "menu".
 *
 * @class 
 */
let Menu = {};
export {Menu as default};

Menu.initialized = false;
Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
Menu.createMenu = function(text) {

    //initialize menus, if needed
    if(!Menu.initialized) {
        Menu.initialize();
    }

    var labelElement = uiutil.createElementWithClass("div", "visiui-menu-label");
    labelElement.innerHTML = text;
    return new MenuHeader(labelElement);
}

/** This method creates a static menu from the given img url. */
Menu.createMenuFromImage = function(imageUrl) {

    //initialize menus, if needed
    if(!Menu.initialized) {
        Menu.initialize();
    }

    var imageElement = uiutil.createElementWithClass("img", "visiui-menu-label");
    imageElement.src = imageUrl;
    return new MenuHeader(imageElement);
}

/** This method creates a context menu object. */
Menu.createContextMenu = function() {

    //initialize menus, if needed
    if(!Menu.initialized) {
        Menu.initialize();
    }

    return new MenuBody();
}

Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    Menu.show(menuBody);
}

Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing that header closes the active menu otherwise show the menu
	if(Menu.activeMenu === menuHeader) {
		//active menu - close the menu
		Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		Menu.show(menuHeader.getMenuBody());
	}
}

Menu.globalPress = function(event) {
    if(event.target.classList.contains("visiui-menu-item")) {
        //menu item click - handled in menu item
        return;
    }
    else if(event.target.classList.contains("visiui-menu-label")) {
        //menu header clicked - handled in menu header
        return;
    }
    else {
        //if the mouse is pressed outside the menu, close any active menu
        if(Menu.activeMenu) {
            Menu.hideActiveMenu();
        }
    }
}

//================================
// Internal
//================================

Menu.show = function(menuBody) {
	if(Menu.activeMenu) {
		Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    menuBody.prepareShow();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        Menu.activeMenu = menuBody;
        //set the header to active
        var menuHeader = menuBody.getMenuHeader();
        if((menuHeader)&&(menuHeader.domElement)) {
            menuHeader.domElement.className = "visiui-menu-heading visiui-menu-heading-active";
        }
    }
}

Menu.hideActiveMenu = function() {
	if(Menu.activeMenu) {
        var activeMenu = Menu.activeMenu;
        //set the header to normal (not active)
        var menuHeader = activeMenu.getMenuHeader();
        if((menuHeader)&&(menuHeader.domElement)) {
            menuHeader.domElement.className = "visiui-menu-heading";
        }
        
        var parentElement = activeMenu.getParentElement();
        var menuElement = activeMenu.getMenuElement();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            Menu.activeMenu = null;
        }
        activeMenu.menuHidden();
	}
}

Menu.nonMenuMouseHandler = null;

Menu.initialize = function() {
	window.addEventListener("mousedown",Menu.globalPress);
	Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
Menu.deinitialize = function() {
	window.removeEventListener("mousedown",Menu.globalPress);
	Menu.initialized = false;
}

//##################################################################################################


/** This is a menu component
 * This class shoudl only be constructed internally the Menu namespace. 
 * Before it is constructed, the Menu should be initialized.
 *
 * @class 
 */
class MenuBody {

    constructor() {
        
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
    getMenuElement() {
        return this.menuDiv;
    }

    /** This returns the parent element for the menu.  */
    getParentElement() {
        return this.parentElement;
    }

    /** This returns the parent element for the menu.  */
    getMenuHeader() {
        return this.menuHeader;
    }

    /** This returns the parent element for the menu.  */
    getIsContext() {
        return (this.menuHeader == null);
    }

    /** This is called before the menu body is shown */
    prepareShow() {
        if(this.isOnTheFlyMenu) {
            this.constructItemsForShow();
        }
    }

    /** This is called after the menu body is hidden. */
    menuHidden() {
        if(this.isOnTheFlyMenu) {
            this.destroyItemsForHides();
        }
    }

    /** This method is used to attach the menu to the menu head, in a static menu. */
    attachToMenuHeader(menuHeader) {
        //attach menu to heading
        this.parentElement = menuHeader.getElement();
        this.menuDiv.style.left = "0%";
        this.menuDiv.style.top = "100%";
        this.menuHeader = menuHeader;
    }

    /** This method is used to set the position for a context menu. The x and y coordinates
     * should be the coordinates in the parent element. It is recommended to use the 
     * document body. */
    setPosition(x, y, parentElement) {
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
    setAsOnTheFlyMenu(menuItemsCallback) {
        this.isOnTheFlyMenu = true;
        this.menuItemsCallback = menuItemsCallback;
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    addEventMenuItem(title, eventName, eventData, eventManager) {
        var itemInfo = {};
        itemInfo.title = title;
        itemInfo.eventName = eventName;
        itemInfo.eventData = eventData;
        itemInfo.eventManager = eventManager;
        this.addMenuItem(itemInfo);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    addCallbackMenuItem(title, callback) {
        var itemInfo = {};
        itemInfo.title = title;
        itemInfo.callback = callback;
        this.addMenuItem(itemInfo);
    }
        
    /** this adds a menu item that dispatchs the given event when clicked. */
    addMenuItem(itemInfo) {
        itemInfo.element = uiutil.createElementWithClass("div","visiui-menu-item");
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
            itemInfo.element.onclick = (event) => {
                //close menu
                Menu.hideActiveMenu();

                //do menu action
                if(itemInfo.eventName) {
                    //dispatch event
                    itemInfo.eventManager.dispatchEvent(itemInfo.eventName,itemInfo.eventData);
                }
                else if(itemInfo.callback) {
                    //use the callback
                    itemInfo.callback();
                }
            }
        }
        
        this.menuDiv.appendChild(itemInfo.element);
        this.menuItems[itemInfo.title] = itemInfo;
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    setMenuItems(itemInfos) {
        for(var i = 0; i < itemInfos.length; i++) {
            this.addMenuItem(itemInfos[i]);
        }
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    removeMenuItem(title) {
        var itemInfo = this.menuItems[title];
        if(itemInfo) {
            this.menuDiv.removeChild(itemInfo.element);
            delete this.menuItems[title];
        }
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    removeAllMenuItems() {
        for(var title in this.menuItems) {
            this.removeMenuItem(title);
        }
    }

    //================================
    // Internal
    //================================

    /** This method creates the menu body that is shown below the header. */
    createMenuElement() {
        this.menuDiv = uiutil.createElementWithClass("div","visiui-menu-body");
    }

    constructItemsForShow () {
        if(this.menuItemsCallback) {
            var menuItems = this.menuItemsCallback();
            this.setMenuItems(menuItems);
        }
    }

    /** This is called after the menu body is hidden. */
    destroyItemsForHides() {
        if(this.menuDiv) {
            uiutil.removeAllChildren(this.menuDiv);
        }
        this.menuItems = {};
    }

    createChildMenuBody(menuItems) {
        var childMenuBody = new MenuBody();
        childMenuBody.setMenuItems(menuItems);
        return childMenuBody;
    }

}

//###########################################################################################################

/** This is a menu component, attached to the given dom element
 * This class shoudl only be constructed internally the Menu namespace. 
 * Before it is constructed, the Menu should be initialized.
 *
 * @class 
 */
class MenuHeader {

    constructor(labelElement) {
        
        //variables
        this.labelElement = labelElement;
        this.domElement = uiutil.createElementWithClass("div", "visiui-menu-heading");
        this.domElement.appendChild(this.labelElement);
        this.menuBody = new MenuBody();

        //construct the menu
        this.labelElement.onmousedown = (e) => {
            Menu.menuHeaderPressed(this);
        }
   
        //attach menu to heading
        this.menuBody.attachToMenuHeader(this);
    }

    /** this returns the dom element for the menu heading. */
    getElement() {
        return this.domElement;
    }

    /** this returns the dom element for the menu heading. */
    setChildLocation(childLocation) {
        this.childLocation = childLocation;
    }

    /** this returns the dom element for the menu heading. */
    getChildLocation() {
        return this.childLocation;
    }

    /** this returns the dom element for the menu object. */
    getMenuBody() {
        return this.menuBody;
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    addEventMenuItem(title, eventName, eventData, eventManager) {
        this.menuBody.addEventMenuItem(title,eventName, eventData, eventManager);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    addCallbackMenuItem(title, callback) {
        this.menuBody.addCallbackMenuItem(title,callback);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    addMenuItem(itemInfo) {
        this.menuBody.addMenuItem(itemInfo);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    setMenuItems(itemInfos) {
        this.menuBody.setMenuItems(itemInfos);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    removeMenuItem(title) {
        this.menuBody.removeMenuItem(title);
    }

    /** this adds a menu item that dispatchs the given event when clicked. */
    removeAllMenuItems() {
        this.menuBody.removeAllMenuItems();
    }

    /** This sets a callback to create the menu when the menu is opened. This is
     * for static menus where we do not want to populate it ahead of time. */
    setAsOnTheFlyMenu(getMenuItemsCallback) {
        this.menuBody.setAsOnTheFlyMenu(getMenuItemsCallback);
    }

}
	

	