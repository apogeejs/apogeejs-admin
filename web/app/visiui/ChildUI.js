/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.ChildUI = function(child,parentElement) {

    this.object = child;
    this.name = child.getName();
    this.parentElement = parentElement;

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    this.window = new visicomp.visiui.StackWindow(this.parentElement,this.name,options);
    
    //load the content div
    var contentDiv = visicomp.visiui.createElement("div",null,
            {
                "position":"absolute",
                "top":"0px",
                "bottom":"0px",
                "right":"0px",
                "left":"0px"
            });
    this.window.setContent(contentDiv);

	switch(child.getType()) {
		case "package":
            visicomp.app.visiui.PackageUI.populatePackageWindow(this,child);
			break;
			
		case "table":
            visicomp.app.visiui.TableUI.populateTableWindow(this,child);
			break;
			
		case "function":
            visicomp.app.visiui.FunctionUI.populateFunctionWindow(this,child);
			break;
			
		default:
			alert("Unsupported object type for a UI object");
	}
    
    //show the window
    this.window.show();
}

visicomp.app.visiui.ChildUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.ChildUI.prototype.getContentElement = function() {
    return this.window.getContent();
}

/** This method responds to a "new" menu event. */
visicomp.app.visiui.ChildUI.prototype.deleteObject = function() {
	var eventData = {};
	eventData.child = this.object;
	var workspace = this.object.getWorkspace();
    
    var result = this.workspace.callHandler(
        visicomp.core.deletechild.DELETE_CHILD_HANDLER,
        eventData);
		
    return result;
}

/** This method removes the window element from the parent. */
visicomp.app.visiui.ChildUI.prototype.deleteUIElement = function() {
    if((this.parentElement)&&(this.window)) {
		var windowElement = this.window.getElement();
		this.parentElement.removeChild(windowElement);
	}
}


