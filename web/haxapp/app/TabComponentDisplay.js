/** This component represents a json table object. */
haxapp.app.TabComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
    
    this._loadTabEntry();
};

haxapp.app.TabComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

haxapp.app.TabComponentDisplay.prototype.changeParent = function(newParentComponent,oldParentComponent) {
}

haxapp.app.TabComponentDisplay.prototype.setBannerState = function() {
    
}

haxapp.app.TabComponentDisplay.prototype.updateData = function() {
    
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.TabComponentDisplay.prototype._loadTabEntry = function() {
    this.tab = this.component.getWorkspaceUI().requestTab(this.object.getFullName(),true);   
    this.displayObject = this.component.createComponentDisplay(this.tab);   
}
