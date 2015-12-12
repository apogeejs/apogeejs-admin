
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
