/** This component represents a json table object. */
apogeeapp.app.TreeComponentDisplay = function(component) {
    this.component = component;
    this.member = component.getMember();
    
    this.treeEntry = this.createTreeEntry();
    //opnly needed for parents...
    this.treeEntry.setSortFunction(apogeeapp.app.TreeComponentDisplay.treeSortFunction);
    //this should be overwritten in component
    this.treeEntry.setExtraSortParam(0);
};

apogeeapp.app.TreeComponentDisplay.prototype.getTreeEntry = function() {
    return this.treeEntry;
}

apogeeapp.app.TreeComponentDisplay.prototype.getState = function() {
    return this.treeEntry.getState();
}

apogeeapp.app.TreeComponentDisplay.prototype.setState = function(state) {
    this.treeEntry.setState(state);
}

apogeeapp.app.TreeComponentDisplay.prototype.setComponentTypeSortOrder = function(typeSortOrder) {
    this.treeEntry.setExtraSortParam(typeSortOrder);
}

apogeeapp.app.TreeComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
    var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    oldParentTreeEntry.removeChild(this.treeEntry);
    
    var newParentTreeEntry = newParentComponent.getTreeEntry();
    newParentTreeEntry.addChild(this.treeEntry);
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
    this.treeEntry.setLabel(this.member.getName());
}
//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.TreeComponentDisplay.prototype.createTreeEntry = function() {
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
    
    var labelText = this.member.getName();
    var iconUrl = this.component.getIconUrl();
    var isRoot = ((this.member.isParent)&&(this.member.isRoot()));
    return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, openCallback, menuItemCallback,isRoot);
}

/** This is used to sort the child tree entries. 
 * We allow for a different ordering for different types by using the extrar sort parameter.
 * (for now, we put folers first. Other component type parameters can be set too) */
apogeeapp.app.TreeComponentDisplay.treeSortFunction = function(entry1,entry2) {
    var typeOrderDiff = (entry1.getExtraSortParam() - entry2.getExtraSortParam());
    if(typeOrderDiff) {
        return typeOrderDiff;
    }
    else {
        return entry1.getLabel().localeCompare(entry2.getLabel());
    }
}
