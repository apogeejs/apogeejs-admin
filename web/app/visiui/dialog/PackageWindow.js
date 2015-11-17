/** This method shows a create package dialog. The argument onCreateFunction
 * should take the package name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.packageWindow = function(package) {

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    var window = new visicomp.visiui.StackWindow(package.parentElement,package.name,options);
    
    package.window = window;
    package.windowEventManager =  window.getEventManager();
    
    //load the content div
    var content = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });
            
	package.contentElement = content;

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

