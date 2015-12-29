/** This is a mixin that encapsulates the base functionality of a parent container for a control
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.app.visiui.ParentContainer = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.app.visiui.ParentContainer.init = function() {
    this.prevNewChildX = 0;
    this.prevNewChildY = 0;
    this.wrapCount = 0;
}

//constants for window placement
visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X = 75;
visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y = 75;
visicomp.app.visiui.WorkspaceUI.MIN_WRAP_WIDTH = 20; 
visicomp.app.visiui.WorkspaceUI.MIN_WRAP_HEIGHT = 200;

//==============================
// Public Instance Methods
//==============================

/** This is the initializer for the component. The object passed is the core object
 * associated with this control. 
 * @protected */
visicomp.app.visiui.ParentContainer.getContainerElement = function() {
    return this.containerElement;
}

/** this is used to identify if this is the root folder. */
visicomp.app.visiui.WorkspaceUI.prototype.getNextWindowPosition = function() {
    var x = this.prevNewChildX + visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X;
    var y = this.prevNewChildY + visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y;
    
    if( ((x > this.containerElement.offsetWidth)&&(x > visicomp.app.visiui.WorkspaceUI.MIN_WRAP_WIDTH)) && 
        ((y > this.containerElement.offsetHeight)&&(y > visicomp.app.visiui.WorkspaceUI.MIN_WRAP_HEIGHT)) ) {
        this.wrapCount++;
        x = visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_X * (this.wrapCount + 1);
        y = visicomp.app.visiui.WorkspaceUI.DELTA_CHILD_Y;
    }
    
    this.prevNewChildX = x;
    this.prevNewChildY = y;
    
    return [x,y];
}

//==============================
// Protected Instance Methods
//==============================

/** This is the initializer for the component. The object passed is the core object
 * associated with this control. 
 * @protected */
visicomp.app.visiui.ParentContainer.setContainerElement = function(containerElement) {
    this.containerElement = containerElement;
}