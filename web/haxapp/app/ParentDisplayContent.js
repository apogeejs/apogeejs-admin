/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 * 
 * NOW IT IS A CLASS, FOR NOW AT LEAST
 */


/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.ParentDisplayContent = function(component,container,options) {
    
    //base init
    haxapp.app.DisplayContent.init.call(this,component,container,options);
    haxapp.ui.ParentContainer.init.call(this,container.getBody(),container);
	haxapp.ui.ParentHighlighter.init.call(this,container.getBody());
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditDisplayContent.writeToJson);
//    this.addCleanupAction(haxapp.app.EditDisplayContent.destroy);

    this.initUI();
    
    this.memberUpdated();

}

//add components to this class
hax.base.mixin(haxapp.app.ParentDisplayContent,haxapp.app.DisplayContent);
hax.base.mixin(haxapp.app.ParentDisplayContent,haxapp.ui.ParentContainer);
hax.base.mixin(haxapp.app.ParentDisplayContent,haxapp.ui.ParentHighlighter);

/** This creates and adds a display for the child component to the parent container. */
haxapp.app.ParentDisplayContent.prototype.addChildComponent = function(childComponent) {
    var windowComponentDisplay = childComponent.createWindowDisplay();
    var childWindow = windowComponentDisplay.getWindowEntry();

    childWindow.setParent(this);
    var pos = this.getNextWindowPosition();
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
    
    this.container.setScrollingContentElement();
    
    var workspaceUI = this.component.getWorkspaceUI();
    
    //add context menu to create childrent
    var contentElement = this.container.getBody();
    var parentMember = this.component.getParentMember();
    var app = workspaceUI.getApp();
    app.setFolderContextMenu(contentElement,parentMember);
    
    
    //window options
    var memberWindowOptions = {};
    memberWindowOptions.minimizable = true;
    memberWindowOptions.maximizable = true;
    memberWindowOptions.resizable = true;
    memberWindowOptions.movable = true;
    memberWindowOptions.frameColorClass = "visicomp_windowColor";
    memberWindowOptions.titleBarClass = "visicomp_titleBarClass";
    
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


