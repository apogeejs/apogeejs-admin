/** This method shows a create package dialog. The argument onCreateFunction
 * should take the package name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showPackageWindow = function(packageUI) {

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    var window = new visicomp.visiui.StackWindow(packageUI.parentElement,packageUI.name,options);
    
    packageUI.window = window;
    packageUI.windowEventManager =  window.getEventManager();
    
    //load the content div
    var content = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });
            
	packageUI.contentElement = content;

//dummy size
window.setSize(500,500);
    window.setContent(content);
    
    //show the window
    window.show();  
    
//    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    table.windowEventManager.addListener("resize", resizeCallback);
}

