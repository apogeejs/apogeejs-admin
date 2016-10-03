/** This method shows a create folder dialog. The argument onCreateFunction
 * should take the folder name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
hax.app.visiui.dialog.showCreateWorkspaceDialog = function(onCreateFunction) {

    var dialog = hax.visiui.createDialog({"movable":true});
    dialog.setTitle("&nbsp;");
    
    //add a scroll container
    var contentContainer = hax.visiui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = hax.visiui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(hax.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New Workspace"}));
    content.appendChild(line);
    
    //input
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Name:"));
    var inputElement = hax.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        hax.visiui.closeDialog(dialog);
    }
    
    var onCreate = function() {
        var name = inputElement.value.trim();
        if(name.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var closeDialog = onCreateFunction(name);
        if(closeDialog) {
			hax.visiui.closeDialog(dialog);
		}    
    }
    line.appendChild(hax.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(hax.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}


