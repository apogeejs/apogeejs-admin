    
/** This method adds to the standard hax menus.  */
haxapp.app.Hax.prototype.addToMenuBar = function(menuBar,menus) {
    	
    //add an exit menu item to the file menu
    var menu = menus["Workspace"];
    if(!menu) {
        alert("Implementation Error - Workspace menu not found!");
    }
    var exitCallback = haxapp.app.Hax.getExitCallback();
    menu.addCallbackMenuItem("Exit",exitCallback);
}

haxapp.app.Hax.getExitCallback = function() {
    return function() {
        var remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        window.close();
    }
}
