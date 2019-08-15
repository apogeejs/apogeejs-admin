import {bannerConstants,getBanner,getIconOverlay} from "/apogeeapp/app/component/banner.js";

import PageDisplayContainer from "/apogeeapp/app/component/literatepage/PageDisplayContainer.js";

/** This component represents a json table object. */
export default class PageChildComponentDisplay {

    constructor(component, parentComponentDisplay, options) {
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
        this.isExpanded = true;
        
    
        //this is the window in which the component is displayed
        this.loadComponentDisplay();
        
        //connect to parent
        this.setIsPageShowing(this.parentComponentDisplay.getIsShowing());
        this.parentComponentDisplay.addListener(apogeeapp.ui.SHOWN_EVENT,() => this.setIsPageShowing(true));
        this.parentComponentDisplay.addListener(apogeeapp.ui.HIDDEN_EVENT,() => this.setIsPageShowing(false));
        

        //add a cleanup action to the base component - component must already be initialized
    //    this.addCleanupAction(PageChildComponentDisplay.destroy);
    };



    getElement() {
        return this.mainElement;
    }

    getComponent() {
        return this.component;
    }

    getMember() {
        return this.member;
    }

    setBannerState(bannerState,bannerMessage) {
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

    updateData() {
        //update the title
        this.titleBarTitleElement.innerHTML = this.member.getDisplayName();

        //update the content in instantiated view mode elements
        for(var viewType in this.displayContainerMap) {
            var displayContainer = this.displayContainerMap[viewType];
            displayContainer.memberUpdated();
        }
    }

    /** This gets the current window state, to reconstruct the view. */
    getStateJson() {
        var json = {};
        var dataPresent = false;
        
        if(dataPresent) return json;
        else return undefined;
    }

    /** This gets the current window state, to reconstruct the view. */
    setStateJson(json) {
        
    }

    /** This should be called by the component when it discards this display. */
    deleteDisplay() {
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

    setIsExpanded(isExpanded) {
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


    /** This is the standard window for the component.  
     * @private */
    loadComponentDisplay() {

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
            
            var displayContainer = new PageDisplayContainer(this.component, viewType);
            
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
    addTitleBar() {
        
        this.titleBarContainer = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarClass",this.mainElement);

        this.titleBarActiveElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarActiveClass",this.titleBarContainer);
        this.titleBarMenuElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarMenuClass",this.titleBarContainer);
        this.titleBarTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarTitleClass",this.titleBarContainer);
        this.titleBarViewsElement = apogeeapp.ui.createElementWithClass("div","visiui_pageChild_titleBarViewsClass",this.titleBarContainer);
        
        //-----------------
        // title
        //-----------------
        this.titleBarTitleElement.innerHTML = this.member.getDisplayName();
        
        //-----------------
        // show/hide (active)
        //-----------------
        this.expandImage = apogeeapp.ui.createElementWithClass("img","visiui_pageChild_expandContractClass",this.titleBarActiveElement);
        this.expandImage.src = apogeeapp.ui.getResourcePath(PageChildComponentDisplay.EXPAND_BUTTON_PATH);
        this.expandImage.onclick = () => this.setIsExpanded(true);
        this.contractImage = apogeeapp.ui.createElementWithClass("img","visiui_pageChild_expandContractClass",this.titleBarActiveElement);
        this.contractImage.src = apogeeapp.ui.getResourcePath(PageChildComponentDisplay.CONTRACT_BUTTON_PATH);
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

    setIsPageShowing(isPageShowing) {
        if(this.isPageShowing != isPageShowing) {
            this.isPageShowing = isPageShowing;
            this.updateChildDisplayStates();
        }
    }

    updateChildDisplayStates() {
        var componentBodyShowing = ((this.isPageShowing)&&(this.isExpanded));
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
    setIconOverlay(element) {
        if(this.iconOverlayElement) {
            this.clearIconOverlay();
            if(element) {
                this.iconOverlayElement.appendChild(element);
            }
        }
    }

    clearIconOverlay() {
        if(this.iconOverlayElement) {
            apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
        }
    }

}

/** This value is used as the background color when an editor is read only. */
PageChildComponentDisplay.NO_EDIT_BACKGROUND_COLOR = "#f4f4f4";

/** This method returns the main dom element for the window frame. */
PageChildComponentDisplay.EXPAND_BUTTON_PATH = "/closed_gray.png";
PageChildComponentDisplay.CONTRACT_BUTTON_PATH = "/opened_gray.png";

