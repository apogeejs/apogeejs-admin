/** This method shows a create folder dialog. The argument onCreateFunction
 * should take the folder name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showCreateWorkspaceDialog = function(onCreateFunction) {

    var dialog = visicomp.visiui.createDialog({"movable":true});
    dialog.setTitle("&nbsp;");
    
    //add a scroll container
    var contentContainer = visicomp.visiui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = visicomp.visiui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New Workspace"}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Name:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        visicomp.visiui.closeDialog(dialog);
    }
    
    var onCreate = function() {
        var name = inputElement.value.trim();
        if(name.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var closeDialog = onCreateFunction(name);
        if(closeDialog) {
			visicomp.visiui.closeDialog(dialog);
		}    
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}


