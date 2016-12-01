
/** This method shows a open workspace dialog. The argument onOpenFunction
 * takes single argment, the workspace text. It does not need a return value. */
haxapp.app.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialog = haxapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");

    //add a scroll container
    var contentContainer = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = haxapp.ui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        onOpenFunction(jsonText);
        
        haxapp.ui.closeDialog(dialog);
	}
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}

