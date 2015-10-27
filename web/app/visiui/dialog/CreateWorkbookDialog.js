/** This method shows a create worksheet dialog. The argument onCreateFunction
 * should take the worksheet name as an argument and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.createWorkbookDialog = function(onCreateFunction) {

    var dialog = new visicomp.visiui.Dialog("",{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New Workbook"}));
    content.appendChild(line);
    
    //input
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Name:"));
    var inputElement = visicomp.visiui.createElement("input",{"type":"text"});
    line.appendChild(inputElement);
    content.appendChild(line);
    
    //buttons
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    var onCancel = function() {
        dialog.hide();
    }
    
    var onCreate = function() {
        var name = inputElement.value.trim();
        if(name.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var result = onCreateFunction(name);
        
        if(!result.success) {
            alert("There was an error adding the workbook: " + result.msg);
            return;
        }
        
        dialog.hide();
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}


