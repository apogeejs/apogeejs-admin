/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.ChildUI = function(parentElement,name) {

    this.parentElement = parentElement;

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    this.window = new visicomp.visiui.StackWindow(this.parentElement,name,options);
    
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

//	switch(child.getType()) {
//		case "folder":
//            visicomp.app.visiui.FolderUI.populateFolderWindow(this,child);
//			break;
//			
//		case "table":
//            visicomp.app.visiui.TableUI.populateTableWindow(this,child);
//			break;
//			
//		case "function":
//            visicomp.app.visiui.FunctionUI.populateFunctionWindow(this,child);
//			break;
//            
//        case "control":
//			var controlEngine = child.getControlEngine();
//			//create a special window for custom controls
//			if(controlEngine.isCustomControl) {
//				visicomp.app.visiui.CustomControlUI.populateControlWindow(this,child);
//			}
//			else {
//				visicomp.app.visiui.ControlUI.populateControlWindow(this,child);
//			}
//			break;
//			
//		default:
//			alert("Unsupported object type for a UI object");
//	}
}

visicomp.app.visiui.ChildUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.ChildUI.prototype.getContentElement = function() {
    return this.window.getContent();
}

///** This method responds to a "new" menu event. */
//visicomp.app.visiui.ChildUI.prototype.deleteObject = function() {
//    return visicomp.core.deletechild.deleteChild(this.object);
//}
//
///** This method removes the window element from the parent. */
//visicomp.app.visiui.ChildUI.prototype.deleteUIElement = function() {
//    if((this.parentElement)&&(this.window)) {
//		var windowElement = this.window.getElement();
//		this.parentElement.removeChild(windowElement);
//	}
//}


