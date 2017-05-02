/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 * 
 * NOW IT IS A CLASS, FOR NOW AT LEAST
 */


/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.ParentDisplayContent = function(component,options) {
    
    this.component = component;
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditDisplayContent.writeToJson);
//    this.addCleanupAction(haxapp.app.EditDisplayContent.destroy);

    this.initUI();
    
    this.memberUpdated();

}

/** This creates and adds a display for the child component to the parent container. */
haxapp.app.ParentDisplayContent.prototype.getOuterElement = function() {
    return this.containerElement;
}

/** This creates and adds a display for the child component to the parent container. */
haxapp.app.ParentDisplayContent.prototype.addChildComponent = function(childComponent) {
    
    //for now skip parent components
    if(childComponent.isParentComponent) return;
       
//    //window options
//    var memberWindowOptions = {};
//    memberWindowOptions.minimizable = true;
//    memberWindowOptions.maximizable = true;
//    memberWindowOptions.resizable = true;
//    memberWindowOptions.movable = true;
//    memberWindowOptions.frameColorClass = "visicomp_windowColor";
//    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";
    
    var windowComponentDisplay = childComponent.getWindowDisplay();
    var childWindow = windowComponentDisplay.getWindowEntry();

    childWindow.setParent(this.parentContainer);
    var pos = this.parentContainer.getNextWindowPosition();
    childWindow.setPosition(pos[0],pos[1]);
    childWindow.show();
}

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.ParentDisplayContent.prototype.getContentIsShowing = function() {
    return this.container.getContentIsShowing(); 
}

/** This value is used as the background color when an editor is read only. */
haxapp.app.ParentDisplayContent.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";


/** This method updates the table data 
 * @private */    
haxapp.app.ParentDisplayContent.prototype.memberUpdated = function() {
}


/** This method populates the frame for this component. 
 * @protected */
haxapp.app.ParentDisplayContent.prototype.initUI = function() {
    
    this.containerElement = haxapp.ui.createElement("div");
    this.parentContainer = new haxapp.ui.ParentContainer(this.containerElement);
    
    var workspaceUI = this.component.getWorkspaceUI();
    
    //add context menu to create childrent
    var parentMember = this.component.getParentMember();
    var app = workspaceUI.getApp();
    app.setFolderContextMenu(this.containerElement,parentMember);
    
    var children = parentMember.getChildMap();
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        this.addChildComponent(childComponent);
    }
}


//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** @protected */
haxapp.app.ParentDisplayContent.prototype.destroy = function() {
}

/** This serializes the table component. */
haxapp.app.ParentDisplayContent.prototype.writeToJson = function(json) {
    json.viewType = this.viewType;
}


