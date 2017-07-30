
/** This method shows a open workspace dialog. The argument onOpenFunction
 * takes single argment, the workspace text. It does not need a return value. */
apogeeapp.app.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialog = apogeeapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");
    
    var line;
    
    //no scroll container - we will fit the dialog to the content
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
    dialog.setContent(content);
  
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = apogeeapp.ui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        apogeeapp.ui.closeDialog(dialog);
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        onOpenFunction(jsonText);
        
        apogeeapp.ui.closeDialog(dialog);
	}
    
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    apogeeapp.ui.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}

