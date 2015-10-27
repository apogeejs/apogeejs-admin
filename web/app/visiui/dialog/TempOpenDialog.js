
/** This method shows a open workbook dialog. The argument onOpenFunction
 * should take the worksheet text as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.openWorkbookDialog = function(onOpenFunction) {

    var dialog = new visicomp.visiui.Dialog("Dialog",{"resizable":true,"movable":true});
    var content = document.createElement("div");
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Open Workbook"}));
    content.appendChild(line);
    
    //instructions
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"innerHTML":"Paste saved workbook data in the space below."}));
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
        
        var result = onOpenFunction(jsonText);
        
        if(!result.success) {
            alert("There was an error opening the workbook: " + result.msg);
            return;
        }
        
        //if we get here we should close the dialog
        dialog.hide();
    }
    
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Open","onclick":onOpen}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}

