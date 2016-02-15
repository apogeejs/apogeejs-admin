/** This method shows a dialog to select from additional components. */
visicomp.app.visiui.dialog.showSelectComponentDialog = function(componentList,onSelectFunction) {

    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
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
        dialog.hide();
    }
    
    var onCreate = function() {
		var componentType = select.value;
        onSelectFunction(componentType);
        dialog.hide();
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
}



