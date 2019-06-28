/** This component represents a json table object.
 * The member argument is the main member for this component. The folder argument is 
 * the parent folde associated with this component, which may be different from the
 * main member, which is the case for the folder function. */
apogeeapp.app.CanvasFolderComponentDisplay = function(component,member,folder) {
    this.component = component;
    this.member = member;
    this.folder = folder;
    
    this.loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditDisplayContent.destroy);
};

apogeeapp.app.CanvasFolderComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

apogeeapp.app.CanvasFolderComponentDisplay.prototype.closeTab = function() {
    if(this.tab) {
        this.tab.close();
        this.tab = null;
    }
}

apogeeapp.app.CanvasFolderComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
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

apogeeapp.app.CanvasFolderComponentDisplay.prototype.updateData = function() {
    this.tab.setTitle(this.member.getName());
}

/** This method is used to bring the child component to the front. */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.showChildComponent = function(childComponent) {
    var windowComponentDisplay = childComponent.getComponentDisplay();
    if(windowComponentDisplay) {
        var childWindow = windowComponentDisplay.getDisplayFrame();
        if(childWindow) {
            this.parentContainer.bringToFront(childWindow);
        }
    }
}



/** This creates and adds a display for the child component to the parent container. */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
    var childComponentDisplay;
    var childDisplayState = childComponent.getChildDisplayState();
    
    //create a new component display for this child
    if(childComponent.isEditComponent) {
        childComponentDisplay = new apogeeapp.app.EditWindowComponentDisplay(childComponent,childDisplayState);
    }
    else if(childComponent.isParentComponent) {
        childComponentDisplay = new apogeeapp.app.ParentWindowComponentDisplay(childComponent,childDisplayState);
    }
    else {
        throw new Error("Unrecognized child component type! " + childComponent.constructor)
    }
    childComponent.setComponentDisplay(childComponentDisplay);
    
    var childWindow = childComponentDisplay.getDisplayFrame();
    
    //set position
    var pos = childComponentDisplay.getPreferredPosition();
    if(!pos) {
        pos = this.parentContainer.getNextWindowPosition();
    }
    childWindow.setPosition(pos.x,pos.y);
    
    this.parentContainer.addWindow(childWindow);
    
    //set state 
    var state = childComponentDisplay.getPreferredState();
    childWindow.setWindowState(state);
}

/** This is to record any state in the tab object. */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.getStateJson = function() {
    //noop
}

/** This is to restore any state in the tab object. */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.setStateJson = function(json) {
    //noop
}


//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.loadTabEntry = function() {
    this.tab = new apogeeapp.ui.Tab(this.member.getId());    
   
    //-----------------------
    //set the content
    //-----------------------
    this.createDisplayContent();
    this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);
    
    var tabShown = function() {
        instance.parentContainer.elementIsShown();
    }
    this.tab.addListener(apogeeapp.ui.SHOWN_EVENT,tabShown);
    var tabHidden = function() {
        instance.parentContainer.elementIsHidden();
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

apogeeapp.app.CanvasFolderComponentDisplay.PARENT_CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px"
}

 /** @private */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.createDisplayContent = function() {
   
    this.contentElement = apogeeapp.ui.createElement("div",null,apogeeapp.app.CanvasFolderComponentDisplay.PARENT_CONTAINER_STYLE);
    this.parentContainer = new apogeeapp.ui.WindowParent(this.contentElement);

    //we ony use this context menu and child map for parents
    //modify if we use this elsewhere
    if(!this.folder.isParent) return;
    
    //add content menu
    this.setAddChildrenContextMenu();

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

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.setAddChildrenContextMenu = function() {
    
    var workspaceUI = this.component.getWorkspaceUI();
    var app = workspaceUI.getApp();
    
    this.contentElement.oncontextmenu = event => {
        event.preventDefault();
        event.stopPropagation();
        
        //position the window if we can
        if(event.offsetX) {
            var componentOptions = {};
            var posInfo = {};
            posInfo.x = event.offsetX;
            posInfo.y = event.offsetY;
            componentOptions.windowState = {};
            componentOptions.windowState.posInfo = posInfo;
        }
        
        var initialValues = {};
        initialValues.parentName = this.folder.getFullName();
        
        var contextMenu = new apogeeapp.ui.MenuBody();
        contextMenu.setMenuItems(app.getAddChildMenuItems(initialValues,null,componentOptions));
        
        apogeeapp.ui.Menu.showContextMenu(contextMenu,event);
    }
}


//======================================
// Callbacks
// These are defined as static but are called in the objects context
//======================================

/** @protected */
apogeeapp.app.CanvasFolderComponentDisplay.prototype.destroy = function() {
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



