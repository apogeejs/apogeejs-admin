/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.FunctionUI = function(functionObject,parentElement) {

    this.functionObject = functionObject;
    this.name = functionObject.getName();
    this.parentElement = parentElement;
    this.dataEventManager = functionObject.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below

    //subscribe to update event
    var instance = this;
    var functionUpdatedCallback = function(functionObject) {
        instance.functionUpdated(functionObject);
    }
    this.dataEventManager.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, functionUpdatedCallback);

    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.showFunctionWindow(this);
}

visicomp.app.visiui.FunctionUI.formatString = "\t"

visicomp.app.visiui.FunctionUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.FunctionUI.prototype.createEditDialog = function() {
    
    //create save handler
    var instance = this;
    var onSave = function(functionBody,supplementalCode) {
        return instance.updateFunction(functionBody,supplementalCode);
    };
    
    visicomp.app.visiui.dialog.showUpdateFunctionDialog(this.functionObject,onSave);
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.FunctionUI.prototype.updateFunction = function(functionBody,supplementalCode) {
	
	var functionData = visicomp.app.visiui.FunctionUI.getUpdateEventData(this.functionObject,functionBody,supplementalCode)
	
    var result = this.dataEventManager.callHandler(
        visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,
        functionData);
		
    return result;
}
    
/** This method updates the functionObject data */    
visicomp.app.visiui.FunctionUI.prototype.functionUpdated = function(functionObject) {
    if(this.functionObject !== functionObject) return;
    
    var functionText = functionObject.getFunctionText();
    var supplementalCode = functionObject.getSupplementalCode();
    var code = functionText;
	if(supplementalCode) {
		code += "\n\n/* Supplemental Code */\n\n" +
			supplementalCode;
	}
    if(this.editor) {
        this.editor.getSession().setValue(code);
    }
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.FunctionUI.getUpdateEventData = function(functionObject,functionBody,supplementalCode) {
	
	var functionData = {};
    functionData.member = functionObject;
	functionData.editorInfo = functionBody;
	functionData.functionText = visicomp.app.visiui.FunctionUI.wrapFunctionBody(functionObject.getArgParensString(),functionBody);
	functionData.supplementalCode = supplementalCode;
	
	return functionData;
}

visicomp.app.visiui.FunctionUI.wrapFunctionBody = function(argParensString, functionBody) { 

    var functionText = "function" + argParensString + " {\n" +
        functionBody + "\n" +
    "}";
    return functionText;
}

/** This method removes the window element from the parent. */
visicomp.app.visiui.FunctionUI.prototype.removeFromParent = function() {
    if((this.parentElement)&&(this.window)) {
		var windowElement = this.window.getElement();
		this.parentElement.removeChild(windowElement);
	}
}

