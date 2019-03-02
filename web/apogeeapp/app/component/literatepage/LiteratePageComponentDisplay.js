/** This component represents a json table object. */
apogeeapp.app.LiteratePageComponentDisplay = function(component,member,folder) {
    this.component = component;
    this.member = member;
    this.folder = folder;
    
    this.loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditDisplayContent.destroy);
};

apogeeapp.app.LiteratePageComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.closeTab = function() {
    if(this.tab) {
        this.tab.close();
        this.tab = null;
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_NONE) {
       this.tab.setHeaderContent(null);
    }
    else {
        var banner = apogeeapp.app.banner.getBanner(bannerMessage,bannerState);
        this.tab.setHeaderContent(banner);
    }
    
    if(this.tab) {
        var iconOverlay = apogeeapp.app.banner.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.tab.setIconOverlay(iconOverlay);
        }
        else {
            this.tab.clearIconOverlay();
        }
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.updateData = function() {
    this.tab.setTitle(this.member.getName());
}

/** This method is used to bring the child component to the front. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.showChildComponent = function(childComponent) {
    var childComponentDisplay = childComponent.getComponentDisplay();
    if(childComponentDisplay) {
        alert("Not implemented!");
    }
}



/** This creates and adds a display for the child component to the parent container. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
    var childComponentDisplay;
    var componentDisplayOptions = childComponent.getComponentDisplayOptions();
    
    //create a new component display for this child
    if(childComponent.isEditComponent) {
        childComponentDisplay = new apogeeapp.app.PageChildComponentDisplay(childComponent,componentDisplayOptions);
    }
    else if(childComponent.isParentComponent) {
        //don't display the child parents!
    }
    else {
        throw new Error("Unrecognized child component type! " + childComponent.constructor)
    }
    
    if(childComponentDisplay) {
        //for now there is no state - just show in order
        childComponent.setComponentDisplay(childComponentDisplay);
        var childDisplayElement = childComponentDisplay.getElement();
        this.contentElement.appendChild(childDisplayElement);
    }
}


//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.loadTabEntry = function() {
    this.tab = new apogeeapp.ui.Tab(this.member.getId());    
   
    //-----------------------
    //set the content
    //-----------------------
    this.createDisplayContent();
    this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);
    
    var tabShown = () => {
        this.tabShown();
    }
    this.tab.addListener(apogeeapp.ui.SHOWN_EVENT,tabShown);
    var tabHidden = () => {
        this.tabHidden();
    }
    this.tab.addListener(apogeeapp.ui.HIDDEN_EVENT,tabHidden);
    
    //------------------
    // set menu
    //------------------
    var menu = this.tab.createMenu(this.component.getIconUrl());
    var instance = this;
    var createMenuItemsCallback = function() {
        return instance.component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
    
    //-----------------
    //set the tab title
    //-----------------
    this.tab.setTitle(this.member.getName());
    
    //-----------------------------
    //add the handlers for the tab
    //-----------------------------
    var instance = this;
    var onClose = function() {
        instance.component.closeTabDisplay();
        instance.destroy();
    }
    this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,onClose);
}

apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px"
}

 /** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.createDisplayContent = function() {
   
    this.contentElement = apogeeapp.ui.createElement("div",null,apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE);

    //we ony use this context menu and child map for parents
    //modify if we use this elsewhere
    if(!this.folder.isParent) return;

    //show all children
    var workspaceUI = this.component.getWorkspaceUI();
    var children = this.folder.getChildMap();
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        if(childComponent) {
            this.addChildComponent(childComponent);
        }
    }
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.destroy = function() {
    var children = this.folder.getChildMap();
    var workspaceUI = this.component.getWorkspaceUI();
    
    //TODO THIS LOGIC IS NOT GOOD! FIX IT!
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        if(childComponent) {
            childComponent.closeComponentDisplay();
        }
    }
    
    this.closeTab();
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabShown = function() {
    var children = this.folder.getChildMap();
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        if(childComponent) {
            childComponent.closeComponentDisplay();
        }
    }
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabHidden = function() {
    var children = this.folder.getChildMap();
    for(var childName in children) {
        var child = children[childName];
        var childComponent = workspaceUI.getComponent(child);
        if(childComponent) {
            childComponent.closeComponentDisplay();
        }
    }
}



