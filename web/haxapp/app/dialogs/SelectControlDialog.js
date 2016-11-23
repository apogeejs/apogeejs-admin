/** This method shows a dialog to select from additional components. */
haxapp.app.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = haxapp.ui.createDialog({"movable":true});
    
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
    
    var line;
  
    //title
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(haxapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = haxapp.ui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(haxapp.ui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = haxapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        haxapp.ui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        haxapp.ui.closeDialog(dialog);
    }
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(haxapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);  
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent(content);
    dialog.centerInParent();
}



