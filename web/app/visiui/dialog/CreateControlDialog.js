/** This method shows a create table dialog. The argument onCreateFunction
 * should take the folder and the table name as arguments and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showCreateControlDialog = function(controlTypeMap,objectUIMap,activeFolderKey,onCreateFunction) {

    var dialog = new visicomp.visiui.Dialog({"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"Add Control"}));
    content.appendChild(line);
    
    //control type selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Control Type:"));
    var controlSelect = visicomp.visiui.createElement("select");
    line.appendChild(controlSelect);
    var controlCount = 0;
    for(var key in controlTypeMap) {
		var controlBundle = controlTypeMap[key];
        controlSelect.add(visicomp.visiui.createElement("option",{"text":controlBundle.name}));
        controlCount++;
    }
    content.appendChild(line);
    
    //return if there are no controls
    if(controlCount == 0) {
        alert("There are no registered controls");
        return;
    }
    
    //folder selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Folder:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var key in objectUIMap) {
		var object = objectUIMap[key].object;
		if(object.getType() == "folder") { 
			select.add(visicomp.visiui.createElement("option",{"text":key}));
			if(key == activeFolderKey) {
				select.value = key;
			}
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
        var controlName = controlSelect.value;
        var controlBundle = controlTypeMap[controlName];    
        
		var folderName = select.value;
        var folder = objectUIMap[folderName].object;
        
        var objectName = inputElement.value.trim();
        if(objectName.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var result = onCreateFunction(folder,objectName,controlBundle);
        
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

