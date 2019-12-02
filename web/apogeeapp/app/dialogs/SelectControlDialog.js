import apogeeui from "/apogeeapp/ui/apogeeui.js";
import dialogMgr from "/apogeeapp/ui/window/dialogMgr.js";

/** This method shows a dialog to select from additional components. */
export function showSelectComponentDialog(displayNameList,componentList,onSelectFunction) {
    
    if(displayNameList.length != componentList.length) throw new Error("Mismatch in additional component display name and class name lists!");

    var dialog = dialogMgr.createDialog({"movable":true});
    
    //add a scroll container
    var contentContainer = apogeeui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer,apogeeui.SIZE_WINDOW_TO_CONTENT);
    
    var line;
    
	var content = apogeeui.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = apogeeui.createElement("div",{"className":"dialogLine"});
    line.appendChild(apogeeui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Component Type"}));
    content.appendChild(line);
    
    //folder selection
    line = apogeeui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Component:"));
    var select = apogeeui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < componentList.length; i++) {
		var displayName = displayNameList[i];
        var className = componentList[i];
		select.add(apogeeui.createElement("option",{"text":displayName,"value":className}));
    }
    content.appendChild(line);
    
    //buttons
    line = apogeeui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialogMgr.closeDialog(dialog);
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        dialogMgr.closeDialog(dialog);
    }
    line.appendChild(apogeeui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(apogeeui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    dialog.setContent(content,apogeeui.SIZE_WINDOW_TO_CONTENT);  
    
    //show dialog
    dialogMgr.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}



