    
/** This method adds to the standard apogee menus.  */
apogeeapp.app.Apogee.prototype.addToMenuBar = function(menuBar,menus) {
    	
    //add an exit menu item to the file menu
    var menu = menus["Workspace"];
    if(!menu) {
        alert("Implementation Error - Workspace menu not found!");
    }
    var exitCallback = apogeeapp.app.Apogee.getExitCallback();
    menu.addCallbackMenuItem("Exit",exitCallback);
}

apogeeapp.app.Apogee.getExitCallback = function() {
    return function() {
        var remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        window.close();
    }
}
