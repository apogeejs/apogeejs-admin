/** This component represents a json table object. */
apogeeapp.app.TreeComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
    
    this.treeEntry = this._createTreeEntry();
};

apogeeapp.app.TreeComponentDisplay.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.TreeComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    oldParentTreeEntry.removeChild(this.object.getId());
    
    var newParentTreeEntry = newParentComponent.getTreeEntry();
    newParentTreeEntry.addChild(this.object.getId(),this.treeEntry);
}

apogeeapp.app.TreeComponentDisplay.prototype.deleteDisplay = function() {
    alert("Delete tree component display not implemneted");
}

apogeeapp.app.TreeComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    var iconOverlay = apogeeapp.app.WindowHeaderManager.getIconOverlay(bannerState);
    if(iconOverlay) {
        this.treeEntry.setIconOverlay(iconOverlay);
    }
    else {
        this.treeEntry.clearIconOverlay();
    }
}

apogeeapp.app.TreeComponentDisplay.prototype.updateData = function() {
    this.treeEntry.setLabel(this.object.getName());
}
//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.TreeComponentDisplay.prototype._createTreeEntry = function() {
    //TREE_ENTRY
    //FIX THIS CODE!!!
    //open doesn't work and the context menu is duplicated code (that shouldn't be)
    
    var instance = this;
    
    //menu item callback
    var menuItemCallback = function() {
        var menuItemList = [];
        var openMenuItem = instance.component.getOpenMenuItem();
        if(openMenuItem) {
            menuItemList.push(openMenuItem);
        }
        return instance.component.getMenuItems(menuItemList);
    }
    
    //double click callback
    var openCallback = this.component.createOpenCallback();
    
    var labelText = this.object.getName();
    var iconUrl = this.component.getIconUrl();
    var isRoot = ((this.object.isParent)&&(this.object.isRoot()));
    return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, openCallback, menuItemCallback,isRoot);
}
