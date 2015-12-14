
visicomp.app.visiui.FunctionUI = {};

visicomp.app.visiui.FunctionUI.populateFunctionWindow = function(childUI,functionObject) {
    
    //subscribe to table update event
    var functionUpdatedCallback = function(functionObjLocal) {
        if(functionObjLocal === functionObject) {
            visicomp.app.visiui.FunctionUI.functionUpdated(childUI,functionObject);
        }
    }
    
    var workspace = functionObject.getWorkspace();
    workspace.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, functionUpdatedCallback);
    
    //editor - only for display, read only
    var contentDiv = childUI.getContentElement();
    var editor = ace.edit(contentDiv);
    editor.renderer.setShowGutter(true);
    editor.setReadOnly(true);
    editor.setTheme("ace/theme/eclipse"); //good
    editor.getSession().setMode("ace/mode/javascript"); 
    childUI.editor = editor;
    
    var window = childUI.getWindow();
    
    //resize the editor on window size change
    var resizeCallback = function() {
        editor.resize();
    }
    window.addListener("resize", resizeCallback);
    
    //create the edit button
    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
    editButton.onclick = function() {
        visicomp.app.visiui.FunctionUI.createEditDialog(functionObject);
    }
    window.addTitleBarElement(editButton);
	
//	//create the delete button
//    var deleteButton = visicomp.visiui.createElement("button",{"innerHTML":"Delete"});
//    deleteButton.onclick = function() {
//        //we should get confirmation
//
//		childUI.deleteFunction();
//    }
//    window.addTitleBarElement(deleteButton);

    //dummy size
window.setSize(200,200);

}

visicomp.app.visiui.FunctionUI.formatString = "\t"


visicomp.app.visiui.FunctionUI.createEditDialog = function(functionObject) {
    
    //create save handler
    var onSave = function(functionObject,functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(functionObject,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(functionObject,onSave,"Update Function");
}
    
/** This method updates the functionObject data */    
visicomp.app.visiui.FunctionUI.functionUpdated = function(childUI, functionObject) {
    
    var argParens = functionObject.getArgParensList();
    var functionBody = functionObject.getFunctionBody();
    var supplementalCode = functionObject.getSupplementalCode();
    var code = "function" + argParens + " {\n" + functionBody + "\n}\n";
	if(supplementalCode) {
		code += "\n/* Supplemental Code */\n\n" +
			supplementalCode;
	}
    childUI.editor.getSession().setValue(code);
}




    //add function listener
    var addFunctionListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,declarationName) {
            //seperate name and arglist 
//this is kind of a cludge the way this is done
//we should make a separate edit dialog for this
//we also should change the data taht is stored = so it is not the string and args together
            //get a reg ex and chck format
            var nameLength = declarationName.indexOf("(");
            if(nameLength < 0) {
                alert("Include the argument list with the name.");
                return {"success":false};
            }
            var functionName = declarationName.substr(0,nameLength);
            var argParens = declarationName.substr(nameLength);
    
            var returnValue = visicomp.core.createfunction.createFunction(parent,functionName,argParens);
            if(returnValue.success) {
                var functionObject = returnValue.functionObject;
                var functionUiInit = visicomp.app.visiui.FunctionUI.populateFunctionWindow;
                instance.workspaceUI.objectAdded(functionObject,functionUiInit);
            }
            else {
                //no action for now
            }
            return returnValue;
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("Function",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("folderAddFunction",addFunctionListener);
    