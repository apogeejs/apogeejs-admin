/** This method creates the creates the menu bar, with the attached functionality. 
 * @private */
hax.app.visiui.Hax.prototype.createMenuBar = function() {
    
    //-------------------
    //create menus
    //-----------------------
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "position":"relative",
        "display":"table-row",
        "width":"100%",
        "padding":"2px"
    };
    hax.visiui.applyStyle(menuBar,menuBarStyle);
    menuBar.className = "visicomp_menuBarStyle";
    
    //create the menus
    var menu;

    //Workspace menu
    menu = hax.visiui.Menu.createMenu("Workspace");
    menuBar.appendChild(menu.getElement());
    
    var newCallback = hax.app.visiui.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = hax.app.visiui.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = hax.app.visiui.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = hax.app.visiui.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    menu = hax.visiui.Menu.createMenu("Components");
    menuBar.appendChild(menu.getElement());
    
    //add create child elements
    this.populateAddChildMenu(menu);
    
    //libraries menu
    menu = hax.visiui.Menu.createMenu("Libraries");
    menuBar.appendChild(menu.getElement());
    
    var linksCallback = hax.app.visiui.updatelinks.getUpdateLinksCallback(this);
    menu.addCallbackMenuItem("Update Links",linksCallback);
    
    return menuBar;
    
}

