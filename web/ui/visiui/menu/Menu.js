/** Thiis is a namespace with functions to control menu operation
 *
 * @class 
 */
hax.visiui.Menu = {};

hax.visiui.Menu.initialized = false;
hax.visiui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
hax.visiui.Menu.createMenu = function(text) {
    var element = document.createElement("div");
    element.innerHTML = text;
    return new hax.visiui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
hax.visiui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = document.createElement("div");
    element.appendChild(imageElement);
    return new hax.visiui.MenuHeader(element);
}

hax.visiui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    hax.visiui.Menu.show(menuBody);
}

hax.visiui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing the header closes the active menu otherwise show the menu
	if(hax.visiui.Menu.activeMenu) {
		//active menu - close the menu
		hax.visiui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		hax.visiui.Menu.show(menuHeader.getMenuBody());
	}
}

hax.visiui.Menu.menuHeaderEntered = function(menuHeader) {
	//if a header is entered and there is an active, non-context menu, open this menu
	if((hax.visiui.Menu.activeMenu)&&(!hax.visiui.Menu.activeMenu.getIsContext())) {
		hax.visiui.Menu.show(menuHeader.getMenuBody());
	}
}

hax.visiui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(hax.visiui.Menu.activeMenu) {
		hax.visiui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

hax.visiui.Menu.show = function(menuBody) {
	if(hax.visiui.Menu.activeMenu) {
		hax.visiui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        hax.visiui.Menu.activeMenu = menuBody;
    }
}

hax.visiui.Menu.hideActiveMenu = function() {
	if(hax.visiui.Menu.activeMenu) {
        var parentElement = hax.visiui.Menu.activeMenu.getParentElement();
        var menuElement = hax.visiui.Menu.activeMenu.getMenuElement();
        var menuHeader = hax.visiui.Menu.activeMenu.getMenuHeader();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            hax.visiui.Menu.activeMenu = null;
        }	
        if(menuHeader) {
            menuHeader.restoreNormalAppearance();
        }
	}
}

hax.visiui.Menu.nonMenuMouseHandler = null;

hax.visiui.Menu.initialize = function() {
	window.addEventListener("mousedown",hax.visiui.Menu.nonMenuPressed);
	hax.visiui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
hax.visiui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",hax.visiui.Menu.nonMenuPressed);
	hax.visiui.Menu.initialized = false;
}
	