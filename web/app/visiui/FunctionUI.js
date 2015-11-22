/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.visiui.FunctionUI = function(functionObject,parentElement) {

    this.functionObject = functionObject;
    this.name = functionObject.getName();
    this.parentElement = parentElement;
    this.dataEventManager = functionObject.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below

    //subscribe to update event
    var instance = this;
    var functionUpdatedCallback = function(functionObject) {
        instance.updateFunctionData(functionObject);
    }
    this.dataEventManager.addListener(visicomp.core.updatemember.MEMEBER_UPDATED_EVENT, functionUpdatedCallback);

    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.showFunctionWindow(this);
}

visicomp.visiui.FunctionUI.formatString = "\t"

visicomp.visiui.FunctionUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.visiui.FunctionUI.prototype.createEditDialog = function() {
    
    //create save handler
    var instance = this;
    var onSave = function(handlerData) {
        return instance.dataEventManager.callHandler(
            visicomp.core.updatemember.UPDATE_MEMBER_HANDLER,handlerData);
    };
    
    visicomp.app.visiui.dialog.showUpdateFunctionDialog(this.functionObject,onSave);
}
    
/** This method updates the functionObject data */    
visicomp.visiui.FunctionUI.prototype.updateFunctionData = function(functionObject) {
    if(this.functionObject != functionObject) return;
    
    var functionText = functionObject.getFunctionText();
    var supplementalCode = functionObject.getSupplementalCode();
    var code = functionText + 
        "\n\n/* Supplemental Code */\n\n" +
        supplementalCode;
    if(this.editor) {
        this.editor.getSession().setValue(code);
    }
}

