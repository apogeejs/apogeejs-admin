import {bannerConstants,getBanner} from "/apogeeapp/app/component/banner.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import WebDisplayContainer from "/apogeeapp/app/component/webpage/WebDisplayContainer.js";

/** This is the component display for a web page.
 * NOTES:
 * - I currently allow only one view to be displayed. The can be changed to allow multiple display containers and views.
 */
export default class WebComponentDisplay {

    constructor(component, activeView) {
        this.component = component;
        this.member = component.getMember();

        this.activeView = activeView;
        this.displayContainer = null;
        this.savedActiveViewUiState = null;
        
        //these are the header elements
        this.mainElement = null;
        this.bannerContainer = null;
    
        //this is the window in which the component is displayed
        this.loadComponentDisplay();

        //add a cleanup action to the base component - component must already be initialized
    //    this.addCleanupAction(PageChildComponentDisplay.destroy);
    };

    setIsShowing(isShowing) {
        this.displayContainer.setIsShowing(isShowing);
    }

    getIsShowing() {
        this.displayContainer.getIsShowing();
    }

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
        apogeeui.removeAllChildren(this.bannerContainer);
        if(bannerDiv) {
            this.bannerContainer.appendChild(bannerDiv);
        }
    }

    updateData() {
        this.displayContainer.memberUpdated();
    }

    /** This gets the current window state, to reconstruct the view. */
    getStateJson() {
        return undefined;
    }

    /** This gets the current window state, to reconstruct the view. */
    setStateJson(json) {
        
    }

    ////////////////////////////////////////////////////////////

    /** This saves the state only for the single active view. */
    getStateJson() {
        //if the display container is active, update the saved state
        if(this.displayContainer) {
            this.savedActiveViewUiState = displayContainer.getStateJson();
        }

        if(this.savedActiveViewUiState) {
            let json = {};
            json.views = {};
            json.views[this.activeView] = this.savedActiveViewUiState
            return json;
        }
        else {
            return null;
        }
    }

    /** This reads the state only for the single active view. */
    setStateJson(json) {
        if((json)&&(json.views)) {
            this.savedActiveViewUiState = json.views[this.activeView];
            if((this.savedActiveViewUiState)&&(this.displayContainer)) {
                this.displayContainer.setStateJson(this.savedActiveViewUiState);
            }
        }
    }

   ////////////////////////////////////////////////////

    /** This will reload the given data display. */
    reloadDisplay(viewType) {
        if(viewType == this.activeView) {
            if(this.displayContainer) {
                displayContainer.forceClearDisplay();
            }
        }
    }

    /** This should be called by the component when it discards this display. */
    deleteDisplay() {
        //dispose any view elements
        if(this.displayContainer) {
            //refresh the saved UI state
            this.savedActiveViewUiState = displayContainer.getStateJson();

            this.displayContainer.destroy();
            this.displayContainer = null;
        }
    }


    //===============================
    // Private Functions
    //===============================


    /** This is the standard window for the component.  
     * @private */
    loadComponentDisplay() {

        //make the container
        this.mainElement = apogeeui.createElementWithClass("div","visiui_pageChild_mainClass",null);
        
        //add banner container
        this.bannerContainer = apogeeui.createElementWithClass("div","visiui_pageChild_bannerContainerClass",this.mainElement);
        
        //add the view container
        this.viewContainer = apogeeui.createElementWithClass("div","visiui_pageChild_viewContainerClass",this.mainElement);
        
        //create the view element
        this.displayContainer = new WebDisplayContainer(this.component, this.activeView);

        //set the saved state, if there is one
        if(this.savedActiveViewUiState) {
            this.displayContainer.setStateJson(this.savedActiveViewUiState);
        }
        
        //add the view display
        this.viewContainer.appendChild(this.displayContainer.getDisplayElement());
    }

}




