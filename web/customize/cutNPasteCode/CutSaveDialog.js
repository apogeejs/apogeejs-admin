
/** This method shows a save folder dialog. I simply displays the text of
 * the workspace json for the user to copy and save elsewhere. */
haxapp.app.dialog.showSaveWorkspaceDialog = function(data) {

    var dialog = haxapp.ui.createDialog({"resizable":true,"movable":true});
    dialog.setTitle("&nbsp;");
    
    var line;
    
    //no scroll container - we will fit the dialog window to the content
	var content = haxapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
    dialog.setContent(content);
    
    var line;
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Save Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"innerHTML":"Copy the data below and save it in a file to open later."}));
    content.appendChild(line);
    
    //input
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var inputElement = haxapp.ui.createElement("textarea",{"value":data,"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onOk = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onOk}));
    content.appendChild(line);

    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}

