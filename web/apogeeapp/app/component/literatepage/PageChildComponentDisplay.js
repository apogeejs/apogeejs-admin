/** This component represents a json table object. */
apogeeapp.app.PageChildComponentDisplay = function(component, options) {
    this.component = component;
    this.member = component.getMember();
    
    if(!options) options = {};
    this.options = options;
    
    //these are the header elements
    this.titleBarElement = null;
    this.mainDiv = null;
    this.bannerContainer = null;
    
    this.displayContainerMap = null;
   
    //this is the window in which the component is displayed
    this.loadComponentDisplay();
    

    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.PageChildComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
apogeeapp.app.PageChildComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

apogeeapp.app.PageChildComponentDisplay.prototype.getElement = function() {
    return this.mainDiv;
}

apogeeapp.app.PageChildComponentDisplay.prototype.getComponent = function() {
    return this.component;
}

apogeeapp.app.PageChildComponentDisplay.prototype.getMember = function() {
    return this.member;
}

apogeeapp.app.PageChildComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    //update the banner
    var bannerDiv;
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_NONE) {
        bannerDiv = null;
    }
    else {
        bannerDiv = apogeeapp.app.banner.getBanner(bannerMessage,bannerState);
    }
    apogeeapp.ui.removeAllChildren(this.bannerContainer);
    if(bannerDiv) {
        this.bannerContainer.appendChild(bannerDiv);
    }
    
    //update the icon overlay
    if(this.windowFrame) {
        var iconOverlay = apogeeapp.app.banner.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.setIconOverlay(iconOverlay);
        }
        else {
            this.clearIconOverlay();
        }
    }
}

apogeeapp.app.PageChildComponentDisplay.prototype.updateData = function() {
    //update the title
    this.titleBarTitleElement.innerHTML = this.member.getDisplayName();

    //update the content in instantiated view mode elements
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        displayContainer.memberUpdated();
    }
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.PageChildComponentDisplay.prototype.getStateJson = function() {
    var json = {};
    var dataPresent = false;
    
    if(dataPresent) return json;
    else return undefined;
}

/** This gets the current window state, to reconstruct the view. */
apogeeapp.app.PageChildComponentDisplay.prototype.setStateJson = function(json) {
    
}

apogeeapp.app.PageChildComponentDisplay.prototype.deleteDisplay = function() {
    //dispose any view elements
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        var dataDisplay = displayContainer.getDataDisplay();
        if((dataDisplay)&&(dataDisplay.destroy)) {
            dataDisplay.destroy();
        }
    }
}

//===============================
// Private Functions
//===============================

/** This is the standard window for the component.  
 * @private */
apogeeapp.app.PageChildComponentDisplay.prototype.loadComponentDisplay = function() {

    //make the container
    this.mainDiv = apogeeapp.ui.createElementWithClass("div","visiui_litpage_mainClass",null);
    this.createTitleBar();
    
    this.bannerContainer = apogeeapp.ui.createElementWithClass("div","visiui_litpage_bannerContainerClass",this.mainDiv);
    
    //set the content
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    this.displayContainerMap = {};  
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        
        var displayContainer = new apogeeapp.app.PageDisplayContainer(this.component, viewType);
        
        this.mainDiv.appendChild(displayContainer.getElement());
        this.displayContainerMap[viewType] = displayContainer;
    }
    
    var parent = this.member.getParent();
    var workspaceUI = this.component.getWorkspaceUI();
    var parentComponent = workspaceUI.getComponent(parent);
    if(parentComponent) {
        var tabDisplay = parentComponent.getTabDisplay();
//        tabDisplay.addListener(apogeeapp.ui.SHOWN_EVENT,() => this.componentShown());
//        tabDisplay.addListener(apogeeapp.ui.HIDDEN_EVENT,() => this.componentHidden());
    }
}

/** This takes needed action when the component is shown. */
apogeeapp.app.PageChildComponentDisplay.prototype.componentShown = function() {
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        displayContainer.setIsShowing(true);
    }
}

/** This takes needed actions when the component is hidden. */
apogeeapp.app.PageChildComponentDisplay.prototype.componentHidden = function() {
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        displayContainer.setIsShowing(false);
    }
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.app.PageChildComponentDisplay.prototype.setIconOverlay = function(element) {
    if(this.iconOverlayElement) {
        this.clearIconOverlay();
        if(element) {
            this.iconOverlayElement.appendChild(element);
        }
    }
}

apogeeapp.app.PageChildComponentDisplay.prototype.clearIconOverlay = function() {
    if(this.iconOverlayElement) {
        apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
    }
}

apogeeapp.app.PageChildComponentDisplay.prototype.createTitleBar = function() {
    
    this.titleBarElement = apogeeapp.ui.createElementWithClass("div","visiui_litpage_titleBarClass",this.mainDiv);

    this.titleBarLeftElements = apogeeapp.ui.createElementWithClass("div","visiui_litpage_left_style",this.titleBarElement);
    this.titleBarMenuElement = apogeeapp.ui.createElementWithClass("div","visiui_litpage_menu_style",this.titleBarLeftElements);
    this.titleBarTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_litpage_title",this.titleBarLeftElements);
    
    this.titleBarRightElements = apogeeapp.ui.createElementWithClass("div","visiui_litpage_right_style",this.titleBarElement);
    this.titleBarToolElement = apogeeapp.ui.createElementWithClass("div","visiui_litpage_tool_style",this.titleBarRightElements);
    
    //-----------------
    // title
    //-----------------
    this.titleBarTitleElement.innerHTML = this.member.getDisplayName();
    
    //------------------
    // set menu
    //------------------
    
    var iconUrl = this.component.getIconUrl();
    if(!iconUrl) iconUrl = apogeeapp.ui.getResourcePath(apogeeapp.ui.MENU_IMAGE);
    
    this.menu = apogeeapp.ui.Menu.createMenuFromImage(iconUrl);
    var menuItemCallback = () => {
        return this.component.getMenuItems();
    }
    this.menu.setAsOnTheFlyMenu(menuItemCallback);
  
    this.titleBarMenuElement.appendChild(this.menu.getElement());
    
    //create the icon (menu) overlay
    this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_litpage_icon_overlay_style",this.titleBarMenuElement);

}