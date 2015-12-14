visicomp.app.visiui.ControlUI = {};

visicomp.app.visiui.ControlUI.populateControlWindow = function(childUI,control) {
    
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
    
    //create the edit button
    var editButton = visicomp.visiui.createElement("button",{"innerHTML":"Edit"});
    editButton.onclick = function() {
        visicomp.app.visiui.ControlUI.createEditDialog(control);
    }
    window.addTitleBarElement(editButton);
	
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

visicomp.app.visiui.ControlUI.formatString = "\t";

visicomp.app.visiui.ControlUI.createEditDialog = function(control) {
    
    //create save handler
    var onSave = function(controlObject,functionBody,supplementalCode) {
        return visicomp.core.updatemember.updateCode(controlObject,functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateCodeableDialog(control,onSave,"Update Control");
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







    //add control listener
    var addControlListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,controlName,controlBundle) {
            var controlEngine = controlBundle.createInstance();
            var returnValue = visicomp.core.createcontrol.createControl(parent,controlName,controlEngine);
            if(returnValue.success) {
                var control = returnValue.control;
                var controlUiInit = visicomp.app.visiui.ControlUI.populateControlWindow;
                instance.workspaceUI.objectAdded(control,controlUiInit);
            }
            else {
                //no action for now
            }
            return returnValue;
        }
        visicomp.app.visiui.dialog.showCreateControlDialog(instance.controlMap,instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("folderAddControl",addControlListener);
	

