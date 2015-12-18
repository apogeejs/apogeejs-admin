/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.ControlFrame = function(parentElement,name) {

    this.parentElement = parentElement;

    //create window
    var options = {"minimizable":true,"maximizable":true,"resizable":true,"movable":true};
    this.window = new visicomp.visiui.StackWindow(this.parentElement,options);
    
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
}

visicomp.app.visiui.ControlFrame.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.ControlFrame.prototype.getContentElement = function() {
    return this.window.getContent();
}

///** This method responds to a "new" menu event. */
//visicomp.app.visiui.ControlFrame.prototype.deleteObject = function() {
//    return visicomp.core.deletechild.deleteChild(this.object);
//}
//
///** This method removes the window element from the parent. */
//visicomp.app.visiui.ControlFrame.prototype.deleteUIElement = function() {
//    if((this.parentElement)&&(this.window)) {
//		var windowElement = this.window.getElement();
//		this.parentElement.removeChild(windowElement);
//	}
//}


