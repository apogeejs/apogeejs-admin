/** Thiis is a namespace with functions to control menu operation
 *
 * NOTE - the name haxapp.ui.Menu should be haxapp.ui.menu because this
 * is just a namespace and not a class. 
 *
 * @class 
 */
haxapp.ui.Menu = {};

haxapp.ui.Menu.initialized = false;
haxapp.ui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
haxapp.ui.Menu.createMenu = function(text) {
    var element = haxapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-text");
    element.innerHTML = text;
    return new haxapp.ui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
haxapp.ui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = haxapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-image");
    element.appendChild(imageElement);
    return new haxapp.ui.MenuHeader(element);
}

haxapp.ui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    haxapp.ui.Menu.show(menuBody);
}

haxapp.ui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing that header closes the active menu otherwise show the menu
	if(haxapp.ui.Menu.activeMenu === menuHeader) {
		//active menu - close the menu
		haxapp.ui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		haxapp.ui.Menu.show(menuHeader.getMenuBody());
	}
}

haxapp.ui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(haxapp.ui.Menu.activeMenu) {
		haxapp.ui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

haxapp.ui.Menu.show = function(menuBody) {
	if(haxapp.ui.Menu.activeMenu) {
		haxapp.ui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        haxapp.ui.Menu.activeMenu = menuBody;
        //set the header to active
        var menuHeader = menuBody.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading visiui-menu-heading-active";
        }
    }
}

haxapp.ui.Menu.hideActiveMenu = function() {
	if(haxapp.ui.Menu.activeMenu) {
        //set the header to normal (not active)
        var menuHeader = haxapp.ui.Menu.activeMenu.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading";
        }
        
        var parentElement = haxapp.ui.Menu.activeMenu.getParentElement();
        var menuElement = haxapp.ui.Menu.activeMenu.getMenuElement();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            haxapp.ui.Menu.activeMenu = null;
        }	
	}
}

haxapp.ui.Menu.nonMenuMouseHandler = null;

haxapp.ui.Menu.initialize = function() {
	window.addEventListener("mousedown",haxapp.ui.Menu.nonMenuPressed);
	haxapp.ui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
haxapp.ui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",haxapp.ui.Menu.nonMenuPressed);
	haxapp.ui.Menu.initialized = false;
}
	