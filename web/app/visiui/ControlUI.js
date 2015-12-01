visicomp.app.visiui.ControlUI = {};

visicomp.app.visiui.ControlUI.populateControlWindow = function(childUI,control) {
    
    //subscribe to control update event
    var controlUpdatedCallback = function(controlObject) {
        if(controlObject === control) {
            visicomp.app.visiui.ControlUI.controlUpdated(childUI,control);
        }
    }
    
    var workspace = control.getWorkspace();
    
    workspace.addListener(visicomp.core.updatecontrol.CONTROL_UPDATED_EVENT, controlUpdatedCallback);
    
    
    var window = childUI.getWindow();
    
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
    var onSave = function(control,html,onLoadBody,supplementalCode,css) {
        return visicomp.app.visiui.ControlUI.updateControl(control,html,onLoadBody,supplementalCode,css);
    };
    
    visicomp.app.visiui.dialog.showUpdateControlDialog(control,onSave);
}

/** This method updates the control data */    
visicomp.app.visiui.ControlUI.controlUpdated = function(childUI,control) {
    var window = childUI.getWindow();
    var contentElement = window.getContent();
    contentElement.innerHTML = control.getHtml();
    
    var onLoad = control.getOnLoad();
    if(onLoad) {
        onLoad();
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.ControlUI.updateControl = function(control,html,onLoadBody,supplementalCode,css) {
	
	var updateEventData = visicomp.app.visiui.ControlUI.getUpdateEventData(control,html,onLoadBody,supplementalCode,css);
	
    var workspace = control.getWorkspace();
    var result = workspace.callHandler(
        visicomp.core.updatecontrol.UPDATE_CONTROL_HANDLER,
        updateEventData);
		
    return result;
}

/** This method creates the update event object for this control object. */
visicomp.app.visiui.ControlUI.getUpdateEventData = function(control,html,onLoadBody,supplementalCode,css) {
	
	var controlData = {};
    controlData.control = control;
    controlData.html = html;
    controlData.onLoadBody = onLoadBody;
    controlData.supplementalCode = supplementalCode;
    controlData.css = css;
	
    return controlData;
}









////////////////////////////////////////////////////////////////////////////////
//
//
//
///** This is a editor element for holding an arbitrary JSON object.
// *
// * @class 
// */
//visicomp.app.visiui.ControlUI = function(control,parentElement) {
//
//    this.control = control;
//    this.name = control.getName();
//    this.parentElement = parentElement;
//    this.dataEventManager = control.getWorkspace().getEventManager();
//    this.windowEventManager = null;//look this up below
//
//    //subscribe to update event
//    var instance = this;
//    var controlUpdatedCallback = function(controlObject) {
//        instance.controlUpdated(controlObject);
//    }
//    this.dataEventManager.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, controlUpdatedCallback);
//
//    //create the window and editor (for display, not editing)
//    visicomp.app.visiui.dialog.showControlWindow(this);
//}
//
//
//
//visicomp.app.visiui.ControlUI.prototype.getWindow = function() {
//    return this.window;
//}
//
//visicomp.app.visiui.ControlUI.prototype.createEditDialog = function() {
//    
//    //create save handler
//    var instance = this;
//    var onSave = function(data,formula,supplementalCode) {
//        return instance.updateControl(data,formula,supplementalCode);
//    };
//    
//    visicomp.app.visiui.dialog.showUpdateControlDialog(this.control,onSave);
//}
//
///** This method responds to a "new" menu event. */
//visicomp.app.visiui.ControlUI.prototype.updateControl = function(data,formula,supplementalCode) {
//	
//	var updateEventData = visicomp.app.visiui.ControlUI.getUpdateEventData(this.control,data,formula,supplementalCode);
//	
//    var result = this.dataEventManager.callHandler(
//        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
//        updateEventData);
//		
//    return result;
//}
//
///** This method responds to a "new" menu event. */
//visicomp.app.visiui.ControlUI.prototype.deleteControl = function() {
//	var eventData = {};
//	eventData.child = this.control;
//	
//    var result = this.dataEventManager.callHandler(
//        visicomp.core.deletechild.DELETE_CHILD_HANDLER,
//        eventData);
//		
//    return result;
//}
//    
//
//
///** This method creates the update event object for this control object. */
//visicomp.app.visiui.ControlUI.getUpdateEventData = function(control,data,formula,supplementalCode) {
//	
//	var controlData = {};
//    controlData.member = control;
//	if((formula !== null)&&(formula !== undefined)) {
//		controlData.editorInfo = formula;
//        controlData.functionText = visicomp.app.visiui.ControlUI.wrapControlFormula(formula);
//		controlData.supplementalCode = supplementalCode;
//	}
//	else {
//		controlData.data = data;
//	}
//	
//    return controlData;
//}
//
//visicomp.app.visiui.ControlUI.wrapControlFormula = function(formula) { 
//
//    var functionText = "function() {\n" + 
//        "var value;\n" + 
//        formula + "\n" +
//        "return value;\n\n" +
//    "}";
//    return functionText;
//}
//
///** This method removes the window element from the parent. */
//visicomp.app.visiui.ControlUI.prototype.removeFromParent = function() {
//    if((this.parentElement)&&(this.window)) {
//		var windowElement = this.window.getElement();
//		this.parentElement.removeChild(windowElement);
//	}
//}
//
