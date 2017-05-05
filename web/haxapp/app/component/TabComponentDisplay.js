/** This component represents a json table object. */
haxapp.app.TabComponentDisplay = function(component) {
    this.component = component;
    this.object = component.getObject();
    
    this._loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addSaveAction(haxapp.app.EditDisplayContent.writeToJson);
//    this.addCleanupAction(haxapp.app.EditDisplayContent.destroy);
};

haxapp.app.TabComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

haxapp.app.TabComponentDisplay.prototype.deleteDisplay = function() {
    alert("Delete tabcomponent display not implemneted");
}

haxapp.app.TabComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE) {
        this.windowHeaderManager.hideBannerBar();
    }
    else {
        this.windowHeaderManager.showBannerBar(bannerMessage,bannerState);
    }
}

haxapp.app.TabComponentDisplay.prototype.updateData = function() {
    this.tab.setName(this.object.getName());
    //this.tab.setTitle(this.object.getDisplayName());
    this.displayContent.memberUpdated();
}

/** This creates and adds a display for the child component to the parent container. */
haxapp.app.TabComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
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

//===============================
// Private Functions
//===============================

/** @private */
haxapp.app.TabComponentDisplay.prototype._loadTabEntry = function() {
    this.tab = this.component.getWorkspaceUI().requestTab(this.object.getId(),true);
    
    //-----------------------
    //add headers for display
    //-----------------------
    this.windowHeaderManager = new haxapp.app.WindowHeaderManager();
    this.tab.setContent(this.windowHeaderManager.getOuterElement());

    //-----------------------
    //set the content
    //-----------------------
    this._createDisplayContent();
    this.windowHeaderManager.setContent(this.contentElement);
    
    //------------------
    // set menu
    //------------------
    var menu = this.tab.getMenu();
    
    //menu items
    var menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this.component,this.generator);
    menuItemInfoList.push(itemInfo);
    
    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.component.createDeleteCallback(itemInfo.title);
    menuItemInfoList.push(itemInfo);
    
    //set the menu items
    menu.setMenuItems(menuItemInfoList);
    
    //-----------------
    //set the tab title
    //-----------------
    this.tab.setName(this.object.getName());
}

 /** @private */
haxapp.app.TabComponentDisplay.prototype._createDisplayContent = function() {
   
    this.contentElement = haxapp.ui.createElement("div");
    this.parentContainer = new haxapp.ui.ParentContainer(this.contentElement);

    var workspaceUI = this.component.getWorkspaceUI();

    //add context menu to create childrent
    var parentMember = this.component.getParentMember();
    var app = workspaceUI.getApp();
    app.setFolderContextMenu(this.contentElement,parentMember);

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




