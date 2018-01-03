    
/** This method adds to the standard apogee menus.  */
apogeeapp.app.Apogee.prototype.addToMenuBar = function(menuBar,menus) {
    	
    //add an exit menu item to the file menu
    var menu = menus["Workspace"];
    if(!menu) {
        alert("Implementation Error - Workspace menu not found!");
    }
    var exitCallback = apogeeapp.app.Apogee.getExitCallback();
    menu.addCallbackMenuItem("Exit",exitCallback);
    
    // add a debugger menu
    var name = "Debugging";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBar.appendChild(menu.getElement());
    menus[name] = menu;
    
    var debuggerCallback = () => {
        require("electron").remote.getCurrentWindow().openDevTools();
    }
    menu.addCallbackMenuItem("Open Debugger",debuggerCallback);
}

apogeeapp.app.Apogee.getExitCallback = function() {
    return function() {
        var remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        window.close();
    }
}
