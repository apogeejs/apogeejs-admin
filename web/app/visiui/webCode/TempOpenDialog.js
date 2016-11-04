
/** This method shows a open workspace dialog. The argument onOpenFunction
 * should take the folder text as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
hax.app.visiui.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialog = hax.visiui.createDialog({"resizable":true,"movable":true});
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
  
    //title
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(hax.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(hax.visiui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var inputElement = hax.visiui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        hax.visiui.closeDialog(dialog);
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        var closeDialog = onOpenFunction(jsonText);
        if(closeDialog) {
            hax.visiui.closeDialog(dialog);
        }
	}
    
    line.appendChild(hax.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(hax.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}

