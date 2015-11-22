/** This method shows a create package dialog. The argument onCreateFunction
 * should take the package name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showFunctionWindow = function(functionUI) {

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    var window = new visicomp.visiui.StackWindow(functionUI.parentElement,functionUI.name,options);
    
    functionUI.window = window;
    functionUI.windowEventManager =  window.getEventManager();
    
    //load the content div
    var content = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });
            
    //editor - only for display, read only
    var editor = ace.edit(content);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/javascript"); 
    functionUI.editor = editor;

//dummy size
window.setSize(300,300);
    window.setContent(content);
    
    //create the edit button
    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
    editButton.onclick = function() {
        functionUI.createEditDialog();
    }
    window.addTitleBarElement(editButton);
    
    //show the window
    window.show();  
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    functionUI.windowEventManager.addListener("resize", resizeCallback);
}

