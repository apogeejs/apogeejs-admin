
/** This method shows a save folder dialog. I simply displays the text of
 * the workspace json for the user to copy and save elsewhere. */
hax.app.visiui.dialog.showSaveWorkspaceDialog = function(app,workspaceUI) {
    
    if((!workspaceUI)||(!workspaceUI.getWorkspace())) {
        alert("There is no workspace open.");
        return;
    }
    
    var workspaceJson = workspaceUI.toJson();
    var workspaceText = JSON.stringify(workspaceJson);

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
    
    var line;
  
    //title
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(hax.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Save Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(hax.visiui.createElement("div",{"innerHTML":"Copy the data below and save it in a file to open later."}));
    content.appendChild(line);
    
    //input
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var inputElement = hax.visiui.createElement("textarea",{"value":workspaceText,"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var onOk = function() {
        hax.visiui.closeDialog(dialog);
    }
    
    line.appendChild(hax.visiui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onOk}));
    content.appendChild(line);

    dialog.setContent(content);
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}

