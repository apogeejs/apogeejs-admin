/** This method shows the doalog to set the arg list for a function. */
visicomp.app.visiui.dialog.showUpdateFolderFunctionReturnDialog = function(folderFunction,onSaveFunction) {

    var dialogParent = visicomp.visiui.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update FolderFunction Return"}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Return Value:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    inputElement.value = folderFunction.getReturnValueString();
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onSave = function() {
        //parse the arg list into an array
        var returnValue = inputElement.value.trim();
        
        var complete = onSaveFunction(returnValue);   
        if(complete) {
            dialog.hide();
        }

    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"OK","onclick":onSave}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    var coords = dialogParent.getCenterOnPagePosition(dialog);
    dialog.setPosition(coords[0],coords[1]);
}


