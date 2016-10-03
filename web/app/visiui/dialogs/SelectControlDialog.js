/** This method shows a dialog to select from additional components. */
hax.app.visiui.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = hax.visiui.createDialog({"movable":true});
    
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
    line.appendChild(hax.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = hax.visiui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(hax.visiui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = hax.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        hax.visiui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        hax.visiui.closeDialog(dialog);
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



