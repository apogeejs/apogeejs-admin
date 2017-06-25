/** Thiis is a namespace with functions to control menu operation
 *
 * NOTE - the name apogeeapp.ui.Menu should be apogeeapp.ui.menu because this
 * is just a namespace and not a class. 
 *
 * @class 
 */
apogeeapp.ui.Menu = {};

apogeeapp.ui.Menu.initialized = false;
apogeeapp.ui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
apogeeapp.ui.Menu.createMenu = function(text) {
    var element = apogeeapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-text");
    element.innerHTML = text;
    return new apogeeapp.ui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
apogeeapp.ui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = apogeeapp.ui.createElementWithClass("div", "visiui-menu-heading visiui-menu-image");
    element.appendChild(imageElement);
    return new apogeeapp.ui.MenuHeader(element);
}

apogeeapp.ui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    apogeeapp.ui.Menu.show(menuBody);
}

apogeeapp.ui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing that header closes the active menu otherwise show the menu
	if(apogeeapp.ui.Menu.activeMenu === menuHeader) {
		//active menu - close the menu
		apogeeapp.ui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		apogeeapp.ui.Menu.show(menuHeader.getMenuBody());
	}
}

apogeeapp.ui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(apogeeapp.ui.Menu.activeMenu) {
		apogeeapp.ui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

apogeeapp.ui.Menu.show = function(menuBody) {
	if(apogeeapp.ui.Menu.activeMenu) {
		apogeeapp.ui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        apogeeapp.ui.Menu.activeMenu = menuBody;
        //set the header to active
        var menuHeader = menuBody.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading visiui-menu-heading-active";
        }
    }
}

apogeeapp.ui.Menu.hideActiveMenu = function() {
	if(apogeeapp.ui.Menu.activeMenu) {
        //set the header to normal (not active)
        var menuHeader = apogeeapp.ui.Menu.activeMenu.getMenuHeader();
        if(menuHeader) {
            menuHeader.className = "visiui-menu-heading";
        }
        
        var parentElement = apogeeapp.ui.Menu.activeMenu.getParentElement();
        var menuElement = apogeeapp.ui.Menu.activeMenu.getMenuElement();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            apogeeapp.ui.Menu.activeMenu = null;
        }	
	}
}

apogeeapp.ui.Menu.nonMenuMouseHandler = null;

apogeeapp.ui.Menu.initialize = function() {
	window.addEventListener("mousedown",apogeeapp.ui.Menu.nonMenuPressed);
	apogeeapp.ui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
apogeeapp.ui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",apogeeapp.ui.Menu.nonMenuPressed);
	apogeeapp.ui.Menu.initialized = false;
}
	