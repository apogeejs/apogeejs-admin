/** This method shows a dialog to select from additional components. */
apogeeapp.app.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialog = apogeeapp.ui.createDialog({"movable":true});
    
    //add a scroll container
    var contentContainer = apogeeapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer);
    
    var line;
    
	var content = apogeeapp.ui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeapp.ui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = apogeeapp.ui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var name = componentList[i];
		select.add(apogeeapp.ui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = apogeeapp.ui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        apogeeapp.ui.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        apogeeapp.ui.closeDialog(dialog);
    }
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(apogeeapp.ui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content);  
    
    //show dialog
    dialog.show();
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}



