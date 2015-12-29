/** This is a window frame with controleld stacking - when the window is clicked
 * it moves to the top of the stack for the given parent container. 
 * The constructor takes the same arguments as a window frame. 
 *
 * @class 
 */
visicomp.visiui.StackWindow = function(options) {
    
    //call the parent constructor
    visicomp.visiui.WindowFrame.call(this,options);
	
    //add the handler to move the active window to the front
    var instance = this;
	var frontHandler = function(e) {
        instance.bringToFront();
    };
    var element = this.getElement();
	element.addEventListener("mousedown",frontHandler);
}
//temp cludge for overriding a function
visicomp.visiui.StackWindow.prototypeBase = Object.create(visicomp.visiui.WindowFrame.prototype);
visicomp.visiui.StackWindow.superSetParentContainer = visicomp.visiui.StackWindow.prototypeBase.setParentContainer;
    
visicomp.visiui.StackWindow.prototype = visicomp.visiui.StackWindow.prototypeBase;
visicomp.visiui.StackWindow.prototype.constructor = visicomp.visiui.StackWindow;
      
/** This method brings a window top the front of the windows for this parent container. */
visicomp.visiui.StackWindow.prototype.setParentContainer = function(parentContainer) {
    visicomp.visiui.StackWindow.superSetParentContainer.call(this,parentContainer);
    
    //lookup the window manager, assoicated by parent container
    //if someone tries to change the parent container, they should update the window manager
    this.groupManager = visicomp.visiui.WindowGroupManager.getWindowManager(parentContainer);
    this.groupManager.addWindow(this);
}      
      
/** This method brings a window top the front of the windows for this parent container. */
visicomp.visiui.StackWindow.prototype.bringToFront = function(e) {
    if(this.groupManager) {
        this.groupManager.bringToFront(this);
    }
}