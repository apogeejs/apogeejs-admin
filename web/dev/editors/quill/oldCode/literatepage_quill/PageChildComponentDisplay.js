import {bannerConstants,getBanner,getIconOverlay} from "/apogeeapp/app/component/banner.js"; 

/** This component represents a json table object. */
apogeeapp.app.PageChildComponentDisplay = function(component, parentComponentDisplay, options) {
    this.component = component;
    this.member = component.getMember();
    this.parentComponentDisplay = parentComponentDisplay;
    
    if(!options) options = {};
    this.options = options;
    
    //these are the header elements
    this.titleBarElement = null;
    this.iconOverlayElement
    this.mainElement = null;
    this.bannerContainer = null;
    this.expandImage;
    this.contractImage;
    
    this.displayContainerMap = null;
    
    this.isPageShowing = false;
    this.isComponentOnPage = false;
    this.isExpanded = true;
    
   
    //this is the window in which the component is displayed
    this.loadComponentDisplay();
    
    //connect to parent
    this.setIsPageShowing(this.parentComponentDisplay.getIsShowing());
    this.parentComponentDisplay.addListener(apogeeapp.ui.SHOWN_EVENT,() => this.setIsPageShowing(true));
    this.parentComponentDisplay.addListener(apogeeapp.ui.HIDDEN_EVENT,() => this.setIsPageShowing(false));
    

    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.PageChildComponentDisplay.destroy);
};

/** This value is used as the background color when an editor is read only. */
apogeeapp.app.PageChildComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

apogeeapp.app.PageChildComponentDisplay.prototype.getElement = function() {
    return this.mainElement;
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
    if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
        bannerDiv = null;
    }
    else {
        bannerDiv = getBanner(bannerMessage,bannerState);
    }
    apogeeapp.ui.removeAllChildren(this.bannerContainer);
    if(bannerDiv) {
        this.bannerContainer.appendChild(bannerDiv);
    }
    
    //update the icon overlay
    var iconOverlay = getIconOverlay(bannerState);
    if(iconOverlay) {
        this.setIconOverlay(iconOverlay);
    }
    else {
        this.clearIconOverlay();
    }
}

apogeeapp.app.PageChildComponentDisplay.prototype.updateData = function() {
    //update the title
    this.titleBarTitleElement.innerHTML = this.component.getDisplayName();

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

/** This should be called by the component when it discards this display. */
apogeeapp.app.PageChildComponentDisplay.prototype.deleteDisplay = function() {
    //dispose any view elements
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        if(displayContainer) {
            displayContainer.destroy();
            delete this.displayContainerMap[viewType];
        }
    }
}

//-------------------
// state management
//-------------------

apogeeapp.app.PageChildComponentDisplay.prototype.setIsComponentOnPage = function(isComponentOnPage) {
    this.isComponentOnPage = isComponentOnPage;
    
    //update state for children, as needed
    this.updateChildDisplayStates();
}

apogeeapp.app.PageChildComponentDisplay.prototype.getIsComponentOnPage = function() {
    return this.isComponentOnPage;
}

apogeeapp.app.PageChildComponentDisplay.prototype.setIsExpanded = function(isExpanded) {
    this.isExpanded = isExpanded;
    //update ui components
    if(isExpanded) {
        this.expandImage.style.display = "none";
        this.contractImage.style.display = "";
        this.titleBarViewsElement.style.display = "";
        this.bannerContainer.style.display = "";
        this.viewContainer.style.display = "";
    }
    else {
        this.expandImage.style.display = "";
        this.contractImage.style.display = "none";
        this.titleBarViewsElement.style.display = "none";
        this.bannerContainer.style.display = "none";
        this.viewContainer.style.display = "none";
    }
    
    //update state for children, as needed
    this.updateChildDisplayStates();
}

//===============================
// Private Functions
//===============================

/** This method returns the main dom element for the window frame. */
apogeeapp.app.PageChildComponentDisplay.EXPAND_BUTTON_PATH = "/expand.png";
apogeeapp.app.PageChildComponentDisplay.CONTRACT_BUTTON_PATH = "/contract.png";

/** This is the standard window for the component.  
 * @private */
apogeeapp.app.PageChildComponentDisplay.prototype.loadComponentDisplay = function() {

    //make the container
    this.mainElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_mainClass",null);
    
    //add title bar
    this.addTitleBar();
    
    //add banner container
    this.bannerContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_bannerContainerClass",this.mainElement);
    
    //add the view container
    this.viewContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_viewContainerClass",this.mainElement);
    
    //add the view elements
    var settings = this.component.getTableEditSettings();
    var viewTypes = settings.viewModes;
    
    this.displayContainerMap = {};  
    for(var i = 0; i < viewTypes.length; i++) {
        var viewType = viewTypes[i];
        
        var displayContainer = new apogeeapp.app.PageDisplayContainer(this.component, viewType);
        
        //add the view title element to the title bar
        this.titleBarViewsElement.appendChild(displayContainer.getViewLabelElement());
        
        //add the view display
        this.viewContainer.appendChild(displayContainer.getDisplayElement());
        
        //store the display container object
        this.displayContainerMap[viewType] = displayContainer;
    }
    
    this.setIsExpanded(this.isExpanded);
}

/** This makes the title bar, and installs it inline */
apogeeapp.app.PageChildComponentDisplay.prototype.addTitleBar = function() {
    
    this.titleBarContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarClass",this.mainElement);

    this.titleBarActiveElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarActiveClass",this.titleBarContainer);
    this.titleBarMenuElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarMenuClass",this.titleBarContainer);
    this.titleBarTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarTitleClass",this.titleBarContainer);
    this.titleBarViewsElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarViewsClass",this.titleBarContainer);
    
    //-----------------
    // title
    //-----------------
    this.titleBarTitleElement.innerHTML = this.component.getDisplayName();
    
    //-----------------
    // show/hide (active)
    //-----------------
    this.expandImage = apogeeapp.ui.createElementWithClass("img","visiui_pageChild_expandContractClass",this.titleBarActiveElement);
    this.expandImage.src = apogeeapp.ui.getResourcePath(apogeeapp.app.PageChildComponentDisplay.EXPAND_BUTTON_PATH);
    this.expandImage.onclick = () => this.setIsExpanded(true);
    this.contractImage = apogeeapp.ui.createElementWithClass("img","visiui_pageChild_expandContractClass",this.titleBarActiveElement);
    this.contractImage.src = apogeeapp.ui.getResourcePath(apogeeapp.app.PageChildComponentDisplay.CONTRACT_BUTTON_PATH);
    this.contractImage.onclick = () => this.setIsExpanded(false);
    
    //------------------
    // menu
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
    this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_icon_overlay_style",this.titleBarMenuElement);

}

apogeeapp.app.PageChildComponentDisplay.prototype.setIsPageShowing = function(isPageShowing) {
    if(!this.isPageShowing) {
        this.isPageShowing = isPageShowing;
        this.updateChildDisplayStates();
    }
}

apogeeapp.app.PageChildComponentDisplay.prototype.updateChildDisplayStates = function() {
    var componentBodyShowing = ((this.isPageShowing)&&(this.isComponentOnPage)&&(this.isExpanded));
    var componentActive = this.isExpanded;
    for(var viewType in this.displayContainerMap) {
        var displayContainer = this.displayContainerMap[viewType];
        if(displayContainer) {
            //notify display container if component display body is loaded
            if(displayContainer.getIsComponentShowing() != componentBodyShowing) {
                displayContainer.setIsComponentShowing(componentBodyShowing);
            }
            //notify display container if component display is active
            if(displayContainer.getIsComponentActive() != componentActive) {
                displayContainer.setIsComponentActive(componentActive);
            }
        }
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

