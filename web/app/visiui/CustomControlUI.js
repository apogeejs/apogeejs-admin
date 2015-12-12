visicomp.app.visiui.CustomControlUI = {};

visicomp.app.visiui.CustomControlUI.populateControlWindow = function(childUI,control) {
    
//    //subscribe to control update event
//    var controlUpdatedCallback = function(controlObject) {
//        if(controlObject === control) {
//            visicomp.app.visiui.ControlUI.controlUpdated(childUI,control);
//        }
//    }
//    
//    var workspace = control.getWorkspace();
//    
//    workspace.addListener(visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT, controlUpdatedCallback);
    
    
    var window = childUI.getWindow();
    
    //set the child UI object onto the control engine
    control.getControlEngine().setWindow(window);
    
    //resize the editor on window size change
//    var resizeCallback = function() {
//        editor.resize();
//    }
//    window.addListener("resize", resizeCallback);
    
    //create the edit buttons
    var editUserCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Formula"});
    editUserCodeButton.onclick = function() {
        visicomp.app.visiui.CustomControlUI.createFormulaEditDialog(control);
    }
    window.addTitleBarElement(editUserCodeButton);
	var editControlCodeButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit Control"});
    editControlCodeButton.onclick = function() {
        visicomp.app.visiui.CustomControlUI.createControlEditDialog(control);
    }
    window.addTitleBarElement(editControlCodeButton);
	
//	//create the delete button
//    var deleteButton = visicomp.visiui.createElement("button",{"innerHTML":"Delete"});
//    deleteButton.onclick = function() {
//        //we should get confirmation
//
//		childUI.deleteControl();
//    }
//    window.addTitleBarElement(deleteButton);

    window.clearSize();
}

visicomp.app.visiui.CustomControlUI.formatString = "\t";

visicomp.app.visiui.CustomControlUI.createFormulaEditDialog = function(control) {
    
    //create save handler
    var onSave = function(controlObject,functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(controlObject,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(control,onSave,"Update Control");
}

visicomp.app.visiui.CustomControlUI.createControlEditDialog = function(control) {
    
    //create save handler
    var onSave = function(controlObject,controlHtml,controlOnLoad,supplementalCode,css) {
		var customControlEngine = controlObject.getControlEngine();
		customControlEngine.update(controlHtml,controlOnLoad,supplementalCode,css);
//figure out what to do with return here
		return {"success":true};
    };
    
    visicomp.app.visiui.dialog.showUpdateCustomControlDialog(control,onSave);
}

///** This method updates the control data */    
//visicomp.app.visiui.ControlUI.controlUpdated = function(childUI,control) {
//    var window = childUI.getWindow();
//    var contentElement = window.getContent();
//    contentElement.innerHTML = control.getHtml();
//    
//    var onLoad = control.getOnLoad();
//    if(onLoad) {
//        onLoad();
//    }
//}







