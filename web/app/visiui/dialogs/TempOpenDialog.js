
/** This method shows a open workspace dialog. The argument onOpenFunction
 * should take the folder text as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showOpenWorkspaceDialog = function(onOpenFunction) {

    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"resizable":true,"movable":true});
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
    
    var line;
    
var content = visicomp.visiui.createElement("div",null,
        {
			"display":"table",
            "overflow":"hidden"
        });
contentContainer.appendChild(content);
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workspace"}));
    content.appendChild(line);
    
    //instructions
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"innerHTML":"Paste saved workspace data in the space below."}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var inputElement = visicomp.visiui.createElement("textarea",{"rows":"15","cols":"75"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons and handler
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onOpen = function() {
        var jsonText = inputElement.value;
        if(jsonText.length == 0) {
            alert("Please paste the file into the input field");
            return;
        }
        
        var closeDialog = onOpenFunction(jsonText);
        if(closeDialog) {
            dialog.hide();
        }
	}
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
//dialog.setContent(contentContainer);
	//set to a dummy size, we will resize to fit
    dialog.setSize(500,500);
    dialog.show();
    
    //size the dialog to the content
    var insideWidth = content.offsetWidth;
    var insideHeight = content.offsetHeight;
    var outsideWidth = contentContainer.offsetWidth;
    var outsideHeight = contentContainer.offsetHeight;
    dialog.setSize(500 + insideWidth - outsideWidth + 20,500 + insideHeight - outsideHeight + 20);
    
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
}

