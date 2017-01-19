/** This component represents a json table object. */
haxapp.app.TabComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
    
    this._loadTabEntry();
};

haxapp.app.TabComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

haxapp.app.TabComponentDisplay.prototype.getDisplayContent = function() {
    return this.displayContent;
}

haxapp.app.TabComponentDisplay.prototype.deleteDisplay = function() {
    alert("Delete tabcomponent display not implemneted");
}

haxapp.app.TabComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == haxapp.app.DisplayContent.BANNER_TYPE_NONE) {
        this.tab.hideBannerBar();
    }
    else {
        this.tab.showBannerBar(bannerMessage,bannerState);
    }
}

haxapp.app.TabComponentDisplay.prototype.updateData = function() {
    this.tab.setName(this.object.getName());
    this.tab.setTitle(this.object.getDisplayName());
    this.displayContent.memberUpdated();
}

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.TabComponentDisplay.prototype._loadTabEntry = function() {
    this.tab = this.component.getWorkspaceUI().requestTab(this.object.getId(),true);   
    this.displayContent = this.component.createDisplayContent(this.tab); 
    this.tab.setName(this.object.getName());
}
