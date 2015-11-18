/** This method shows a create table dialog. The argument onCreateFunction
 * should take the package and the table name as arguments and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.createChildDialog = function(objectName,packages,activePackageName,onCreateFunction) {

    var dialog = new visicomp.visiui.Dialog("",{"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New " + objectName}));
    content.appendChild(line);
    
    //package selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Package:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var key in packages) {
        select.add(visicomp.visiui.createElement("option",{"text":key}));
        if(key == activePackageName) {
            select.value = key;
        }
    }
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
        var packageName = select.value;
        var packageInfo = packages[packageName];
        var package = packageInfo.package;
        var tableName = inputElement.value.trim();
        if(tableName.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var result = onCreateFunction(package,tableName);
        
        if(result.success) {
            dialog.hide();
        }
        else {
            alert("There was an error adding the table: " + result.msg);
        }
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}

