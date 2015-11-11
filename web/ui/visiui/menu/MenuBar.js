/** This is a menu bar. The constructor takes an id for the container and
 * an options object. The menu bar will be appended to the given container.
 * 
 * options: none
 * 
 * @class 
 */
visicomp.visiui.MenuBar = function(containerId,eventManager,options) {
	
    if(!options) {
        options = {};
    }
	
    //variables
    this.eventManager = eventManager;
    this.options = options;
    this.menus = {};
	
    this.div = document.createElement("div");
    visicomp.visiui.applyStyle(this.div,visicomp.visiui.MenuBar.MENU_BAR_STYLE);
    
    //place in container
    var container = document.getElementById(containerId);
    if(container) {
        container.appendChild(this.div);
    } 
    else {
        alert("menu bar container no found");
        return
    }
}

//style info
visicomp.visiui.MenuBar.MENU_BAR_STYLE = {
    //fixed
    
    //configurable
    "background-color":"rgb(217,229,250)",
    "padding":"2px"
}

/** This method adds a menu of the given title. It returns the menu javascript object. */
visicomp.visiui.MenuBar.prototype.addMenu = function(title) {
	var menu = new visicomp.visiui.StaticMenu(title,this.eventManager);
	
    var menuInfo = {};
    menuInfo.title = title;
    menuInfo.jsObject = menu;
    menuInfo.element = menuInfo.jsObject.getHeadingElement();
	
    this.div.appendChild(menuInfo.element);
    this.menus[title] = menuInfo;
	
    return menu;
}

/** this adds a menu item that dispatchs the given event when clicked. */
visicomp.visiui.MenuBar.prototype.removeMenu = function(title) {
    var menuInfo = this.menus[title];
    if(menuInfo) {
        this.menuDiv.removeChild(menuInfo.element);
        delete this.menus[title];
    }
}

/** This gets a javascript menu object by name. */
visicomp.visiui.MenuBar.prototype.getMenu = function(title) {
    return this.menus[title];
}