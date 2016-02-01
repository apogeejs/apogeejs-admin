/** This method shows a create table dialog. The argument onCreateFunction
 * should take the folder and the table name as arguments and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showSelectControlDialog = function(controlList,onSelectFunction) {

    var dialogParent = visicomp.app.visiui.VisiComp.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Select Control Type"}));
    content.appendChild(line);
    
    //folder selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Control:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var i = 0; i < controlList.length; i++) {
		var name = controlList[i];
		select.add(visicomp.visiui.createElement("option",{"text":name}));
    }
    content.appendChild(line);
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onCreate = function() {
		var controlType = select.value;
        onSelectFunction(controlType);
        dialog.hide();
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}



