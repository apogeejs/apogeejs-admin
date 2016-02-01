/** This method shows the doalog to set the arg list for a function. */
visicomp.app.visiui.dialog.showUpdateWorksheetReturnDialog = function(worksheet,onSaveFunction) {

    var dialogParent = visicomp.app.visiui.VisiComp.getDialogParent();
    var dialog = new visicomp.visiui.WindowFrame(dialogParent,{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Update Worksheet Return"}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Return Value:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    inputElement.value = worksheet.getReturnValueString();
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onSave = function() {
        //parse the arg list into an array
        var returnValue = inputElement.value.trim();
        
        var editComplete = undefined;
        try {
            editComplete = onSaveFunction(returnValue);
            
            if(editComplete) {
                dialog.hide();
            }
        }
        finally {
            if(editComplete === undefined) {
                //this catches exceptions thrown in update. This should be user
                //code errors that we want to capture in the debugger for now
                alert("There was an error calculating the result. It will be captured in the debugger.");
                dialog.hide();
            }
        }
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onSave}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}


