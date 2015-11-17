/** This method shows a create package dialog. The argument onCreateFunction
 * should take the package name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.tableWindow = function(table) {

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    var window = new visicomp.visiui.StackWindow(table.parentElement,table.name,options);
    
    table.window = window;
    table.windowEventManager =  window.getEventManager();
    
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
    editor.getSession().setMode("ace/mode/json"); 
    table.editor = editor;

//dummy size
window.setSize(300,300);
    window.setContent(content);
    
    //create the edit button
    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
    editButton.onclick = function() {
        table.createEditDialog();
    }
    window.addElement(editButton);
    
    //show the window
    window.show();  
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    table.windowEventManager.addListener("resize", resizeCallback);
}

