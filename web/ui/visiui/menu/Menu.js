/** Thiis is a namespace with functions to control menu operation
 *
 * @class 
 */
visicomp.visiui.Menu = {};

visicomp.visiui.Menu.initialized = false;
visicomp.visiui.Menu.activeMenu = null;

/** This method creates a static menu with the given text. */
visicomp.visiui.Menu.createMenu = function(text) {
    var element = document.createElement("div");
    element.innerHTML = text;
    return new visicomp.visiui.MenuHeader(element);
}

/** This method creates a static menu from the given img url. */
visicomp.visiui.Menu.createMenuFromImage = function(imageUrl) {
    var imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    var element = document.createElement("div");
    element.appendChild(imageElement);
    return new visicomp.visiui.MenuHeader(element);
}

visicomp.visiui.Menu.showContextMenu = function(menuBody,contextEvent) {
    //create menu and attach to document body
    menuBody.setPosition(contextEvent.clientX, contextEvent.clientY, document.body);
    //cacnel default popup
    contextEvent.preventDefault();
    //show
    visicomp.visiui.Menu.show(menuBody);
}

visicomp.visiui.Menu.menuHeaderPressed = function(menuHeader) {
	//if there is an active menu, pressing the header closes the active menu otherwise show the menu
	if(visicomp.visiui.Menu.activeMenu) {
		//active menu - close the menu
		visicomp.visiui.Menu.hideActiveMenu();
	}
	else {
		//no active menu, open this menu
		visicomp.visiui.Menu.show(menuHeader.getMenuBody());
	}
}

visicomp.visiui.Menu.menuHeaderEntered = function(menuHeader) {
	//if a header is entered and there is an active, non-context menu, open this menu
	if((visicomp.visiui.Menu.activeMenu)&&(!visicomp.visiui.Menu.activeMenu.getIsContext())) {
		visicomp.visiui.Menu.show(menuHeader.getMenuBody());
	}
}

visicomp.visiui.Menu.nonMenuPressed = function() {
	//if the mouse is pressed outside the menu, close any active menu
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.hideActiveMenu();
	}
}

//================================
// Internal
//================================

visicomp.visiui.Menu.show = function(menuBody) {
	if(visicomp.visiui.Menu.activeMenu) {
		visicomp.visiui.Menu.hideActiveMenu();
	}
	var parentElement = menuBody.getParentElement();
    var menuElement = menuBody.getMenuElement();
    if((parentElement)&&(menuElement)) {
        parentElement.appendChild(menuElement);
        visicomp.visiui.Menu.activeMenu = menuBody;
    }
}

visicomp.visiui.Menu.hideActiveMenu = function() {
	if(visicomp.visiui.Menu.activeMenu) {
        var parentElement = visicomp.visiui.Menu.activeMenu.getParentElement();
        var menuElement = visicomp.visiui.Menu.activeMenu.getMenuElement();
        var menuHeader = visicomp.visiui.Menu.activeMenu.getMenuHeader();
        if((parentElement)&&(menuElement)) {
            parentElement.removeChild(menuElement);
            visicomp.visiui.Menu.activeMenu = null;
        }	
        if(menuHeader) {
            menuHeader.restoreNormalAppearance();
        }
	}
}

visicomp.visiui.Menu.nonMenuMouseHandler = null;

visicomp.visiui.Menu.initialize = function() {
	window.addEventListener("mousedown",visicomp.visiui.Menu.nonMenuPressed);
	visicomp.visiui.Menu.initialized = true;
}

/** This method allows you to undo the initialization actions. I am not sure you would ever need to do it. */
visicomp.visiui.Menu.deinitialize = function() {
	window.removeEventListener("mousedown",visicomp.visiui.Menu.nonMenuPressed);
	visicomp.visiui.Menu.initialized = false;
}
	