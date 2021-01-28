import PageDisplayContainer from "/apogeeappview/componentdisplay/PageDisplayContainer.js";

import {uiutil,Menu,bannerConstants,getBanner,getIconOverlay} from "/apogeeui/apogeeUiLib.js";

/** This component represents a json table object. */
export default class PageChildComponentDisplay {

    constructor(componentView, parentComponentDisplay) {
        this.componentView = componentView;
        this.parentComponentDisplay = parentComponentDisplay;

        this.editModeViews = [];
        this.inEditMode = false;
        
        //these are the header elements
        this.iconOverlayElement
        this.mainElement = null;
        this.bannerContainer = null;

        this.titleBarNameElement = null;
        this.cellTypeLabel = null;
        
        this.displayContainerMap = null;
        
        this.isPageShowing = false;

        //make the container
        this.mainElement = uiutil.createElementWithClass("div","visiui_pageChild_mainClass",null);
        this.isHighlighted = false;
    
        //this is the window in which the component is displayed
        if(componentView) this.loadComponentDisplay();
        
        //connect to parent
        this.setIsPageShowing(this.parentComponentDisplay.getIsShowing());
        this.onShow = () => this.setIsPageShowing(true);
        this.onHide = () => this.setIsPageShowing(false);
        this.parentComponentDisplay.addListener(uiutil.SHOWN_EVENT,this.onShow);
        this.parentComponentDisplay.addListener(uiutil.HIDDEN_EVENT,this.onHide);
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

    getPageDisplayContainer(viewType) {
        return this.displayContainerMap[viewType];
    }

    getDataDisplay(viewType) {
        let pageDisplayContainer = this.getPageDisplayContainer(viewType);
        if(pageDisplayContainer) {
            return pageDisplayContainer.getDataDisplay();
        }
        else {
            return null;
        }
    }

    componentUpdated(component) {

        if(component.isDisplayNameUpdated()) {
            this._setTitle();
        }

        if(component.isStateUpdated()) {
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
        if(this.isDestroyed) return; 

        //remove parent listeners
        if(this.parentComponentDisplay) {
            this.parentComponentDisplay.removeListener(uiutil.SHOWN_EVENT,this.onShow);
            this.parentComponentDisplay.removeListener(uiutil.HIDDEN_EVENT,this.onHide);
            this.parentComponentDisplay = null;
        }
        
        //discard the menu
        if(this.menu) {
            this.menu.destroy();
            this.menu = null;
        }

        //dispose any view elements
        for(var viewType in this.displayContainerMap) {
            var displayContainer = this.displayContainerMap[viewType];
            if(displayContainer) {
                displayContainer.destroy();
                delete this.displayContainerMap[viewType];
            }
        }

        //remove the dom elements
        if(this.mainElement) {
            this.mainElement.onclick = null;
            this.mainElement.remove();
        }
        if(this.bannerContainer) this.bannerContainer.remove();
        if(this.viewContainer) this.viewContainer.remove();
        if(this.titleBarContainer) this.titleBarContainer.remove();
        if(this.iconContainerElement) this.iconContainerElement.remove();
        if(this.icon) this.icon.remove();
        if(this.titleBarNameElement) this.titleBarNameElement.remove();
        if(this.cellTypeLabel) this.titleBarNameElement.remove();
        if(this.titleBarViewsElement) this.titleBarViewsElement.remove();

        this.isDestroyed = true;
    }

    /** This function sets this child display to highlighted. It is intended for when this display is
     * inside the current text selection. */
    setHighlight(isHighlighted) {
        if(this.isHighlighted != isHighlighted) {
            this.isHighlighted = isHighlighted;
            if(isHighlighted) {
                this.mainElement.classList.add("visiui_pageChild_highlighted");
            }
            else {
                this.mainElement.classList.remove("visiui_pageChild_highlighted");
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
            if(parentComponentView) {
                let command = parentComponentView.getSelectApogeeNodeCommand(name);
                if(command) {
                    let app = this.componentView.getApp();
                    app.executeCommand(command);
                }
            }
        }
        
        //add title bar
        this.addTitleBar();
        
        //add banner container
        this.bannerContainer = uiutil.createElementWithClass("div","visiui_pageChild_bannerContainerClass",this.mainElement);
        
        //add the view container
        this.viewContainer = uiutil.createElementWithClass("div","visiui_pageChild_viewContainerClass",this.mainElement);
        
        //add the view elements
        var settings = this.componentView.getTableEditSettings();
        var viewModes = settings.viewModes;
        
        this.displayContainerMap = {};  
        if(viewModes.length > 0) {
            for(var i = 0; i < viewModes.length; i++) {
                var viewModeInfo = viewModes[i];
                if((typeof(viewModeInfo) == "string")||(viewModeInfo instanceof String)) {
                    //legacy - when only name was stored, not view info
                    let viewName = viewModeInfo;
                    viewModeInfo = {};
                    viewModeInfo.name = viewName;
                    viewModeInfo.label = viewName;
                    viewModeInfo.isActive = (i == 0); //default is active
                }

                var displayContainer = new PageDisplayContainer(this, viewModeInfo);
                
                //add the view title element to the title bar
                this.titleBarViewsElement.appendChild(displayContainer.getViewSelectorContainer());
                
                //add the view display
                this.viewContainer.appendChild(displayContainer.getDisplayElement());
                
                //store the display container object
                this.displayContainerMap[viewModeInfo.name] = displayContainer;
            }
        }

        this._setTitle();
        this._setBannerState();
    }

    /** This makes the title bar, and installs it inline */
    addTitleBar() {
        
        this.titleBarContainer = uiutil.createElementWithClass("div","visiui_pageChild_titleBarClass",this.mainElement);

        //icon/menu
        var iconSrc = this.componentView.getIconUrl();
        if(!iconSrc) {
            iconSrc = uiutil.getResourcePath(uiutil.GENERIC_CELL_ICON);
        }

        this.iconContainerElement = uiutil.createElementWithClass("div", "visiui-pageChild-icon-container",this.titleBarContainer);
        this.icon = uiutil.createElementWithClass("img", "visiui-pageChild-icon visiui_hideSelection",this.iconContainerElement);
        this.icon.src = iconSrc; 
        this.iconOverlayElement = uiutil.createElementWithClass("div","visiui_pageChild_icon_overlay visiui_hideSelection",this.iconContainerElement);
        
        //cell name label (note - keep this selectable so users can copy the name)
        this.titleBarNameElement = uiutil.createElementWithClass("div", "visiui_pageChild_titleBarNameClass",this.titleBarContainer);

        //menu
        let menuItemCallback = () => {
            return this.componentView.getMenuItems();
        }
        let menuImage = uiutil.getResourcePath(uiutil.DOT_MENU_IMAGE);
        this.menu = Menu.createMenuFromImage(menuImage);
        this.menu.setAsOnTheFlyMenu(menuItemCallback);
        let menuElement = this.menu.getElement();
        //update the style of the menu element
        menuElement.style.verticalAlign = "middle";
        this.titleBarContainer.appendChild(menuElement);

        //views
        this.titleBarViewsElement = uiutil.createElementWithClass("div","visiui_pageChild_titleBarViewsClass",this.titleBarContainer);

        //cell type label
        this.cellTypeLabel = uiutil.createElementWithClass("div","visiui_pageChild_cellTypeLabelClass visiui_hideSelection",this.titleBarContainer);
        this.cellTypeLabel.innerHTML = this.componentView.getComponent().constructor.displayName;

    }

    setIsPageShowing(isPageShowing) {
        if(this.isPageShowing != isPageShowing) {
            this.isPageShowing = isPageShowing;
            this.updateChildDisplayStates();
        }
    }

    /** This method should be called when a given view type enters of exits edit mode */
    notifyEditMode(viewInEditMode,viewTypeName) {
        if(viewInEditMode) {
            if(this.editModeViews.indexOf(viewTypeName) < 0) {
                this.editModeViews.push(viewTypeName);
            }
        }
        else {
            let index = this.editModeViews.indexOf(viewTypeName);
            if(index >= 0) {
                this.editModeViews.splice(index,1);
            }
        }
        let inEditMode = (this.editModeViews.length > 0);

        if(inEditMode != this.inEditMode) this._setEditMode(inEditMode);
    }

    _setEditMode(inEditMode) {
        //set component edit mode
        this.inEditMode = inEditMode;
        if(inEditMode) {
            this.mainElement.classList.add("visiui_pageChild_editMode");
        }
        else {
            this.mainElement.classList.remove("visiui_pageChild_editMode");
        }
            
        //notify page
        if(this.componentView) {
            this.parentComponentDisplay.notifyEditMode(this.inEditMode,this.componentView);
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
            uiutil.removeAllChildren(this.iconOverlayElement);
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
        uiutil.removeAllChildren(this.bannerContainer);
        if(bannerDiv) {
            this.bannerContainer.appendChild(bannerDiv);
        }
        
        //update the icon overlay
        var iconOverlay = getIconOverlay(bannerState,bannerMessage);
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

