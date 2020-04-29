import PageDisplayContainer from "/apogeeview/componentdisplay/literatepage/PageDisplayContainer.js";

import {apogeeui,Menu,bannerConstants,getBanner,getIconOverlay} from "/apogeeui/apogeeUiLib.js";

/** This component represents a json table object. */
export default class PageChildComponentDisplay {

    constructor(componentView, parentComponentDisplay) {
        this.componentView = componentView;
        this.parentComponentDisplay = parentComponentDisplay;
        
        //these are the header elements
        this.iconOverlayElement
        this.mainElement = null;
        this.bannerContainer = null;

        this.titleBarNameElement = null;
        
        this.displayContainerMap = null;
        
        this.isPageShowing = false;

        //make the container
        this.mainElement = apogeeui.createElementWithClass("div","visiui_pageChild_mainClass",null);
    
        //this is the window in which the component is displayed
        if(componentView) this.loadComponentDisplay();
        
        //connect to parent
        this.setIsPageShowing(this.parentComponentDisplay.getIsShowing());
        this.parentComponentDisplay.addListener(apogeeui.SHOWN_EVENT,() => this.setIsPageShowing(true));
        this.parentComponentDisplay.addListener(apogeeui.HIDDEN_EVENT,() => this.setIsPageShowing(false));
    }

    getElement() {
        return this.mainElement;
    }

    setComponentView(componentView) {
        this.componentView = componentView;
        this.loadComponentDisplay();
        this.updateChildDisplayStates();
    }

    getComponentView() {
        return this.componentView;
    }

    getMember() {
        return this.member;
    }

    componentUpdated(component) {

        if(component.isDisplayNameUpdated()) {
            this._setTitle();
        }

        if(component.isMemberFieldUpdated("member","state")) {
            this._setBannerState();
        }

        //update the content in instantiated view mode elements
        for(var viewType in this.displayContainerMap) {
            var displayContainer = this.displayContainerMap[viewType];
            displayContainer.componentUpdated(component);
        }
    }

    /** This gets the current window state, to reconstruct the view. */
    getStateJson() {
        let json = {};
        let dataPresent = false;
        
        //view state
        json.views = {};
        for(var viewType in this.displayContainerMap) {
            let displayContainer = this.displayContainerMap[viewType];
            let viewStateJson = displayContainer.getStateJson();
            if(viewStateJson) {
                json.views[viewType] = viewStateJson;
                dataPresent = true;
            }
        }
        
        if(dataPresent) return json;
        else return undefined;
    }

    /** This gets the current window state, to reconstruct the view. */
    setStateJson(json) {
        if(json) {

            //set view state
            if(json.views) {
                for(let viewType in json.views) {
                    let viewStateJson = json.views[viewType];
                    if(viewStateJson) {
                        let displayContainer = this.displayContainerMap[viewType];
                        if(displayContainer) {
                            displayContainer.setStateJson(viewStateJson);
                        }
                    }
                }
            }
        }
    }

    /** This will reload the given data display. */
    reloadDisplay(viewType) {
        if(this.displayContainerMap) {
            let displayContainer = this.displayContainerMap[viewType];
            if(displayContainer) {
                displayContainer.reloadDisplay();
            }
        }
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


    //===============================
    // Private Functions
    //===============================


    /** This is the standard window for the component.  
     * @private */
    loadComponentDisplay() {
        if(!this.componentView) return;

        //add the click handler, to select this node if it is clicked
        this.mainElement.onclick = () => {
            let name = this.componentView.getName();
            let parentComponentView = this.componentView.getParentComponentView();
            parentComponentView.selectApogeeNode(name);
        }
        
        //add title bar
        this.addTitleBar();
        
        //add banner container
        this.bannerContainer = apogeeui.createElementWithClass("div","visiui_pageChild_bannerContainerClass",this.mainElement);
        
        //add the view container
        this.viewContainer = apogeeui.createElementWithClass("div","visiui_pageChild_viewContainerClass",this.mainElement);
        
        //add the view elements
        var settings = this.componentView.getTableEditSettings();
        var viewTypes = settings.viewModes;
        
        this.displayContainerMap = {};  
        if(viewTypes.length > 0) {
            for(var i = 0; i < viewTypes.length; i++) {
                var viewType = viewTypes[i];
                
                var isMainView = (i == 0);

                var displayContainer = new PageDisplayContainer(this.componentView, viewType, isMainView);
                
                //add the view title element to the title bar
                this.titleBarViewsElement.appendChild(displayContainer.getViewSelectorContainer());
                
                //add the view display
                this.viewContainer.appendChild(displayContainer.getDisplayElement());
                
                //store the display container object
                this.displayContainerMap[viewType] = displayContainer;
            }
        }

        this._setTitle();
        this._setBannerState();
    }

    /** This makes the title bar, and installs it inline */
    addTitleBar() {
        
        this.titleBarContainer = apogeeui.createElementWithClass("div","visiui_pageChild_titleBarClass",this.mainElement);
        this.titleBarMenuElement = apogeeui.createElementWithClass("div","visiui_pageChild_titleBarMenuClass",this.titleBarContainer);
        this.titleBarNameElement = apogeeui.createElementWithClass("div","visiui_pageChild_titleBarNameClass",this.titleBarContainer);
        this.titleBarViewsElement = apogeeui.createElementWithClass("div","visiui_pageChild_titleBarViewsClass",this.titleBarContainer);
        
        //------------------
        // menu
        //------------------
        
        var iconUrl = this.componentView.getIconUrl();
        if(!iconUrl) iconUrl = apogeeui.getResourcePath(apogeeui.MENU_IMAGE);
        
        this.menu = Menu.createMenuFromImage(iconUrl);
        var menuItemCallback = () => {
            return this.componentView.getMenuItems();
        }
        this.menu.setAsOnTheFlyMenu(menuItemCallback);
    
        this.titleBarMenuElement.appendChild(this.menu.getElement());
        
        //create the icon (menu) overlay
        this.iconOverlayElement = apogeeui.createElementWithClass("div","visiui_pageChild_icon_overlay_style",this.titleBarMenuElement);

    }

    setIsPageShowing(isPageShowing) {
        if(this.isPageShowing != isPageShowing) {
            this.isPageShowing = isPageShowing;
            this.updateChildDisplayStates();
        }
    }

    updateChildDisplayStates() {
        var componentBodyShowing = this.isPageShowing;
        for(var viewType in this.displayContainerMap) {
            var displayContainer = this.displayContainerMap[viewType];
            if(displayContainer) {
                //notify display container if component display body is loaded
                if(displayContainer.getIsComponentShowing() != componentBodyShowing) {
                    displayContainer.setIsComponentShowing(componentBodyShowing);
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
            apogeeui.removeAllChildren(this.iconOverlayElement);
        }
    }

    _setTitle() {
        if(!this.componentView) return;

        let title = this.componentView.getDisplayName();
        this.titleBarNameElement.innerHTML = title;
    }

    _setBannerState() {
        if(!this.componentView) return;

        let bannerState = this.componentView.getBannerState();
        let bannerMessage = this.componentView.getBannerMessage();

        //update the banner
        var bannerDiv;
        if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
            bannerDiv = null;
        }
        else {
            bannerDiv = getBanner(bannerMessage,bannerState);
        }
        apogeeui.removeAllChildren(this.bannerContainer);
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

}

/** This method returns the main dom element for the window frame. */
PageChildComponentDisplay.EXPAND_BUTTON_PATH = "/closed_gray.png";
PageChildComponentDisplay.CONTRACT_BUTTON_PATH = "/opened_gray.png";

