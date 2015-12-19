/** This method shows a create table dialog. The argument onCreateFunction
 * should take the folder and the table name as arguments and return an object with the boolean entry
 * "success" and, if false, a msg in the field "msg". On success the dialog will close. */
visicomp.app.visiui.dialog.showCreateChildDialog = function(objectTitle,app,onCreateFunction) {

////////////////////////////////////////////////////////
//for now, load only the active
//later we should allow for multiple
var workspaceUI = app.getActiveWorkspaceUI();
if(!workspaceUI) {
	alert("No workspace is loaded!");
	return;
}
////////////////////////////////////////////////////////

	var controlMap = workspaceUI.getControlMap();

    var dialog = new visicomp.visiui.Dialog({"movable":true});
    
    //create body
    var content = visicomp.visiui.createElement("div",{"className":"dialogBody"}); 
    
    var line;
  
    //title
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(visicomp.visiui.createElement("div",{"className":"dialogTitle","innerHTML":"New " + objectTitle}));
    content.appendChild(line);
    
    //folder selection
    line = visicomp.visiui.createElement("div",{"className":"dialogLine"});
    line.appendChild(document.createTextNode("Folder:"));
    var select = visicomp.visiui.createElement("select");
    line.appendChild(select);
    for(var key in controlMap) {
		var object = controlMap[key].object;
		if(object.getType() == "folder") { 
			select.add(visicomp.visiui.createElement("option",{"text":key}));
//			if(key == activeFolderKey) {
//				select.value = key;
//			}
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
		var folderKey = select.value;
        var folder = controlMap[folderKey].object;
        var objectName = inputElement.value.trim();
        if(objectName.length == 0) {
            alert("The name is invalid");
            return;
        }
        
        var result = onCreateFunction(workspaceUI,folder,objectName);
        
        if(result.success) {
            dialog.hide();
        }
        else {
            alert("There was an error adding the table: " + result.msg);
        }
    }
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
    line.appendChild(visicomp.visiui.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));
    content.appendChild(line);
    
    //show dialog
    dialog.setContent(content);
    dialog.show();
    dialog.centerOnPage();
}

