/** This method shows a dialog to select from additional components. */
visicomp.app.visiui.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = visicomp.visiui.createDialog({"movable":true});
    
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
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(visicomp.visiui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        visicomp.visiui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        visicomp.visiui.closeDialog(dialog);
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



