/** This is a mixin that encapsulates the base functionality of a Component
 *that edits a table. This mixin requires the object be a component.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 * 
 * NOW IT IS A CLASS, FOR NOW AT LEAST
 */


/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.ParentComponentDisplay = function(component,container,options) {
    
    //base init
    haxapp.app.ComponentDisplay.init.call(this,component,container,options);
    haxapp.ui.ParentContainer.init.call(this,this.getDisplayBodyElement(),container);
	haxapp.ui.ParentHighlighter.init.call(this,this.getDisplayBodyElement());
    
    this.container = container;
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditComponentDisplay.writeToJson);
//    this.addCleanupAction(haxapp.app.EditComponentDisplay.destroy);

    this.initUI();

}

//add components to this class
hax.base.mixin(haxapp.app.ParentComponentDisplay,haxapp.app.ComponentDisplay);
hax.base.mixin(haxapp.app.ParentComponentDisplay,haxapp.ui.ParentContainer);
hax.base.mixin(haxapp.app.ParentComponentDisplay,haxapp.ui.ParentHighlighter);

//----------------------
// ParentContainer Methods
//----------------------

/** This method must be implemented in inheriting objects. */
haxapp.app.ParentComponentDisplay.prototype.getContentIsShowing = function() {
    return this.container.getContentIsShowing(); 
}

/** This value is used as the background color when an editor is read only. */
haxapp.app.ParentComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";


/** This method updates the table data 
 * @private */    
haxapp.app.ParentComponentDisplay.prototype.memberUpdated = function() {
    
    var object = this.component.getObject();
}


/** This method populates the frame for this component. 
 * @protected */
haxapp.app.ParentComponentDisplay.prototype.initUI = function() {
    
    this.setScrollingContentElement();
    
    //add context menu to create childrent
    var contentElement = this.getContentElement();
    var folder = this.getObject();
    var app = this.getWorkspaceUI().getApp();
    app.setFolderContextMenu(contentElement,folder);
}


//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** @protected */
haxapp.app.ParentComponentDisplay.prototype.destroy = function() {
}

/** This serializes the table component. */
haxapp.app.ParentComponentDisplay.prototype.writeToJson = function(json) {
    json.viewType = this.viewType;
}
