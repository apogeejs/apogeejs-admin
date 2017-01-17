/** This component represents a json table object. */
haxapp.app.TreeComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
    
    this.treeEntry = this._createTreeEntry();
};

haxapp.app.TreeComponentDisplay.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

haxapp.app.TreeComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    oldParentTreeEntry.removeChild(this.object.getId());
    
    var newParentTreeEntry = newParentComponent.getTreeEntry();
    newParentTreeEntry.addChild(this.object.getId(),this.treeEntry);
}

haxapp.app.TreeComponentDisplay.prototype.setBannerState = function() {
    
}

haxapp.app.TreeComponentDisplay.prototype.updateData = function() {
    treeEntry.setLabel(this.object.getName());
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.TreeComponentDisplay.prototype._createTreeEntry = function() {
    //TREE_ENTRY
    //FIX THIS CODE!!!
    //open doesn't work and the context menu is duplicated code (that shouldn't be)
    
    var instance = this;
    
    var openCallback = function() {
        instance.openDisplay();
    } 
    
    var contextMenuCallback = function(event) {
        var contextMenu = new haxapp.ui.MenuBody();
        
        var callback;
        
        callback = haxapp.app.updatecomponent.getUpdateComponentCallback(instance,instance.generator);
        contextMenu.addCallbackMenuItem("Edit Properties",callback);
        
        callback = instance.createDeleteCallback("Delete");
        contextMenu.addCallbackMenuItem("Delete",callback);
        
        haxapp.ui.Menu.showContextMenu(contextMenu,event);
    }
    
    var labelText = this.getObject().getName();
    return new haxapp.ui.treecontrol.TreeEntry(labelText, openCallback, contextMenuCallback);
}
