import {getSaveBar} from "/apogeeview/componentdisplay/toolbar.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";

/** This is a standin for the display conatiner for the literate page
 * 
 * @class 
 */
export default class PageDisplayContainer {

    constructor(componentDisplay, viewModeInfo) {
        
        //variables
        this.viewModeInfo = viewModeInfo;
        
        this.mainElement = null;
        this.viewToolbarElement = null;
        this.viewLabelElement = null;
        this.headerContainer = null;
        this.viewContainer = null;
        this.viewDisplayElement = null;
        this.errorContainer = null;

        this.viewSelectorContainer = null;
        this.viewActiveElement = null;
        this.viewNameElement = null;
        
        this.isComponentShowing = false;
        this.isViewActive = viewModeInfo.isActive;
        this.isContentLoaded = false;
        
        this.destroyViewOnInactive = true;
        
        this.inEditMode = false;
        
        this.componentDisplay = componentDisplay;
        this.componentView = componentDisplay.getComponentView();
        this.viewTypeName = viewModeInfo.name;
        this.viewTypeLabel = viewModeInfo.label;

        this.dataDisplay = null;
        this.dataDisplayLoaded = false;

        this.errorDisplay = null;
        this.errorDisplayLoaded = false;

        this.heightUiActive = false;
        this.showLessButton = null;
        this.showMoreButton = null;
        this.showMaxButton = null;

        this.savedUiState = {};

        this.uiCompleted = false;
        this.uiDestroyed = false;
        
        //initialize
        this.initUI();
    }

    getComponentView() {
        return this.componentView;
    }

    getComponentDisplay() {
        return this.componentDisplay;
    }

    getDataDisplay() {
        return this.dataDisplay;
    }

    //-------------------
    // state management
    //-------------------

    /** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
    setIsComponentShowing(isComponentShowing) {
        this.isComponentShowing = isComponentShowing;
        this.updateDataDisplayLoadedState();
        this.updateErrorDisplayLoadedState();
    }

    /** This returns the isComponentShowing status of the display. */
    getIsComponentShowing() {
        return this.isComponentShowing;
    }

    getStateJson() {
        //update the saved state json
        this.savedUiState.isViewActive = this.isViewActive;
        if(this.dataDisplay) {
            this.dataDisplay.addUiStateData(this.savedUiState);
        }
        return this.savedUiState;
    }

    setStateJson(json) {
        if(json) {
            this.savedUiState = json;
        }
        else {
            this.savedUiState = {};
        }

        //update any relevent fields
        if(this.savedUiState.isViewActive !== undefined) {
            this.setIsViewActive(this.savedUiState.isViewActive);
        }

        if(this.dataDisplay) {
            this.dataDisplay.readUiStateData(this.savedUiState);
        }
    }

    //---------------------------
    // GUI ELEMENT
    //---------------------------

    /** This method returns the view label element to be used in the component title bar. */
    getViewSelectorContainer() {
        return this.viewSelectorContainer;
    }

    /** This method returns the main dom element for the window frame. */
    getDisplayElement() {
        return this.mainElement;
    }

    /** This method returns the display bar. It is a status and control bar for the data display to manage. */
    getDisplayBarElement() {
        return this.viewDisplayElement;
    }

    //====================================
    // Private Methods
    //====================================

    /** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
    setIsViewActive(isViewActive) {
        this.isViewActive = isViewActive;
        this.updateViewSelectorState();
        this.updateDataDisplayLoadedState();
        this.updateErrorDisplayLoadedState();
    }

    //---------------------------
    // Initialization
    //---------------------------

    /** @private */
    initUI() {
        
        //make the container
        this.mainElement = uiutil.createElementWithClass("div","visiui_displayContainer_mainClass",null);

        //create the view header
        this.viewToolbarElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewToolbarClass",this.mainElement);

        this.viewLabelElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewLabelClass visiui_hideSelection",this.viewToolbarElement);
        this.viewLabelElement.innerHTML = this.viewTypeLabel;

        this.sizingElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewSizingElementClass",this.viewToolbarElement);

        //create the view display
        this.viewDisplayElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplayBarClass",this.viewToolbarElement);
        
        //add the header elment (for the save bar)
        this.headerContainer = uiutil.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);

        //add the view container
        this.errorContainer = uiutil.createElementWithClass("div","visiui_displayContainer_errorContainerClass",this.mainElement);

        //add the view container
        this.viewContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewContainerClass",this.mainElement);

        //make the selector for the view, displayed in the component title bar
        this.viewSelectorContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorContainerClass",null);
        //this is set from link to div so it can not get focus. later, we _do_ want it to get focuus, but if it does we need to make
        //sure button presses are handled properly. (as it would have been, enter does not work to leave the cell)
        this.viewSelectorLink = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorLinkClass visiui_hideSelection",this.viewSelectorContainer);

        this.expandImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass visiui_hideSelection",this.viewSelectorLink);
        this.expandImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH);
    
        this.contractImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass visiui_hideSelection",this.viewSelectorLink);
        this.contractImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_OPENED_IMAGE_PATH);

        this.viewNameElement = uiutil.createElementWithClass("span","visiui_displayContainer_viewSelectorClass visiui_hideSelection",this.viewSelectorLink);
        this.viewNameElement.innerHTML = this.viewTypeLabel;

        this.viewSelectorLink.onclick = () => { this.setIsViewActive(!this.isViewActive); return false; }

        this.updateViewSelectorState();
    }

    /** This tears down any elements created in UI initialization */
    destroyUI() {
        if(!this.uiDestrpoyed) {
            this.uiDestroyed = true;

            if(this.onKeyDown) {
                this.mainElement.removeEventListener("keyDown",this.onKeyDown);
                this.onKeyDown = null;
            }
            this.mainElement = null;
            this.viewToolbarElement = null;
            this.viewLabelElement = null;

            if(this.showLessButton) {
                this.showLessButton.onclick = null;
                this.showLessButton = null;
            }
            if(this.showMoreButton) {
                this.showMoreButton.onclick = null;
                this.showMoreButton = null;
            }
            if(this.showMaxButton) {
                this.showMaxButton.onclick = null;
                this.showMaxButton = null;
            }
            this.sizingElement = null;

            this.viewDisplayElement = null;
            this.headerContainer = null;
            this.viewContainer = null;
            this.viewSelectorContainer = null;
            this.errorContainer = null;

            if(this.viewSelectorLink) {
                this.viewSelectorLink.onclick = null;
                this.viewSelectorLink = null;
            }

            this.expandImage = null;
            this.contractImage = null;

            this.viewNameElement = null;
        }
    }

    updateViewSelectorState() {
        //show/hide ui elements
        if(this.isViewActive) {
            this.mainElement.style.display = ""; 
            this.expandImage.style.display = "none";
            this.contractImage.style.display = "";
        }
        else {
            this.mainElement.style.display = "none";
            this.expandImage.style.display = "";
            this.contractImage.style.display = "none";
        }
    }

    /** This method configures the toolbar for the view display. */
    configureSizingElement() {

        //show the height controls
        if(this.dataDisplay.getUseContainerHeightUi()) {

            if(!this.showLessButton) { //use this as a proxy for other two
                this.showLessButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showLessButton.innerHTML = "less";
                this.showLessButton.onclick = () => this.showLess();
                this.showLessButton.title = "Descrease View Size";
                this.showMoreButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showMoreButton.innerHTML = "more";
                this.showMoreButton.onclick = () => this.showMore();
                this.showMoreButton.title = "Increase View Size";
                this.showMaxButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showMaxButton.innerHTML = "max";
                this.showMaxButton.onclick = () => this.showMax();
                this.showMaxButton.title = "Show Max View Size";
            }

            this.heightUiActive = true;
            this.sizingElement.style.display = "";
        }
        else {
            this.heightUiActive = false;
            this.sizingElement.style.display = "none";
        }
    }

    showLess() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showLess();
            this.updateViewSizeButtons();
        }
    }

    showMore() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showMore();
            this.updateViewSizeButtons();
        }
    }

    showMax() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showMax();
            this.updateViewSizeButtons();
        }
    }

    updateViewSizeButtons() {
        if(this.heightUiActive) {
            let showLessVisible = false, showMoreVisible = false, showMaxVisible = false;
            if(this.dataDisplay) {
                let resizeButtonFlags = this.dataDisplay.getHeightAdjustFlags();
                if(resizeButtonFlags & DATA_DISPLAY_CONSTANTS.RESIZE_SHOW_FLAG) {
                    if(resizeButtonFlags & DATA_DISPLAY_CONSTANTS.RESIZE_MODE_MAX_FLAG) {
                        showLessVisible = true;
                    }
                    else {
                        showLessVisible = true;
                        showMoreVisible = true;
                        showMaxVisible = true;
                    }
                }
            }

            //not currently implemented:
            //DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_LESS
            //DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MORE
            //DATA_DISPLAY_CONSTANTS.RESIZE_DISABLE_MAX

            this.showLessButton.style.display = (showLessVisible) ? "" : "none";
            this.showMoreButton.style.display = (showMoreVisible) ? "" : "none";
            this.showMaxButton.style.display = (showMaxVisible) ? "" : "none";
        }
        
    }

    /** This method shold be called when the content loaded or frame visible state 
     * changes to manage the data display.
     * private */
    updateDataDisplayLoadedState() {
        
        if((this.isComponentShowing)&&(this.isViewActive)) {
            if(!this.dataDisplayLoaded) {
                if(!this.dataDisplay) {
                    //the display should be created only when it is made visible
                    this.dataDisplay =  this.componentView.getDataDisplay(this,this.viewTypeName);
                    if(this.dataDisplay) {
                        this.dataDisplay.readUiStateData(this.savedUiState);
                        this.setDataContent(this.dataDisplay.getContent());
                        this.configureSizingElement();
                        this.dataDisplay.showData();
                    }
                }
            
                if((this.dataDisplay)&&(this.dataDisplay.onLoad)) {
                    this.dataDisplay.onLoad();
                    this.dataDisplayLoaded = true;
                }
            }
        }
        else {
            if(this.dataDisplay) {
                if(this.dataDisplayLoaded) {
                    this.dataDisplayLoaded = false;
                    if(this.dataDisplay.onUnload) this.dataDisplay.onUnload();
                }
                
                //we will destroy the display is the destroyViewOnInactive flag is set, and we are inactive
                if((this.destroyViewOnInactive)&&(!this.isViewActive)) {
                    //update the saved UI state
                    this.dataDisplay.addUiStateData(this.savedUiState);

                    this.cleanupDataDisplayUI();

                    //destroy the display
                    if(this.dataDisplay.destroy) this.dataDisplay.destroy();
                    this.dataDisplay = null;
                }
            }  
        }
        this.updateViewSizeButtons();
    }

    /** This method shold be called when the content loaded or frame visible state 
     * changes to manage the error display.
     * private */
    updateErrorDisplayLoadedState() {
        
        if((this.isComponentShowing)&&(this.isViewActive)) {
            if(!this.errorDisplayLoaded) {
                //getErrorDisplay function may not be present
                if((!this.errorDisplay)&&( this.componentView.getErrorDisplay)) {
                    //the display should be created only when it is made visible
                    this.errorDisplay =  this.componentView.getErrorDisplay(this,this.viewTypeName);
                    if(this.errorDisplay) {
                        //(no saved UI state for error display)
                        this.setErrorContent(this.errorDisplay.getContent());
                        this.errorDisplay.showData();
                    }
                }
            
                if((this.errorDisplay)&&(this.errorDisplay.onLoad)) {
                    this.errorDisplay.onLoad();
                    this.errorDisplayLoaded = true;
                }
            }
        }
        else {
            if(this.errorDisplay) {
                if(this.errorDisplayLoaded) {
                    this.errorDisplayLoaded = false;
                    if(this.errorDisplay.onUnload) this.errorDisplay.onUnload();
                }
                
                //we will alwasy destroy the error when we are inactive
                if(!this.isViewActive) {
                    //(no the saved UI state for error display)

                    this.cleanupErrorDisplayUI();

                    //destroy the display
                    if(this.errorDisplay.destroy) this.errorDisplay.destroy();
                    this.errorDisplay = null;
                }
            }  
        }
        //(no size buttons for error display)
    }

    //------------------------------
    // standard methods
    //------------------------------

    /** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
     * refering to times it is not visible to the user. See further notes in the constructor
     * description. */
    setDestroyViewOnInactive(destroyViewOnInactive) {
        this.destroyViewOnInactive = destroyViewOnInactive;
    }   

    /** This method cleasr the data display. It should only be called when the data display is not showing. 
     * maybe allow this when the display is showing - unload and reload it*/
    reloadDataDisplay() {

        //update the stored UI state json
        this.savedUiState = this.getStateJson();

        //reset any data display specific parts of the ui
        this.cleanupDataDisplayUI();

        //this destrpys the data display, not the container - bad name
        this.deleteDataDisplay();

        //reload display
        this.updateDataDisplayLoadedState();
    }

    /** This method cleasr the data display. It should only be called when the data display is not showing. 
     * maybe allow this when the display is showing - unload and reload it*/
    reloadErrorDisplay() {

        //(no saved ui state for error display)

        //reset any data display specific parts of the ui
        this.cleanupErrorDisplayUI();

        //this destrpys the data display, not the container - bad name
        this.deleteErrorDisplay();

        //reload display
        this.updateErrorDisplayLoadedState();
    }

    cleanupDataDisplayUI() {
        //reset any data display specific parts of the ui
        this.sizingElement.style.display = "none";
        this.heightUiActive = false;
        uiutil.removeAllChildren(this.viewDisplayElement);
        uiutil.removeAllChildren(this.viewContainer);
    }

    cleanupErrorDisplayUI() {
        //reset any error display specific parts of the ui
        uiutil.removeAllChildren(this.errorContainer);
    }

    /** This method destroys the data display. */
    destroy() {
        this.destroyUI();
        this.deleteDataDisplay();
        this.deleteErrorDisplay();
    }

    deleteDataDisplay() {
        if(this.dataDisplay) {
            if(this.dataDisplay.destroy) {
                this.dataDisplay.destroy();
            }
            this.dataDisplay = null;
            this.dataDisplayLoaded = false;
        }
    }

    deleteErrorDisplay() {
        if(this.errorDisplay) {
            if(this.errorDisplay.destroy) {
                this.errorDisplay.destroy();
            }
            this.errorDisplay = null;
            this.errorDisplayLoaded = false;
        }
    }

    /** This method should be called called before the view mode is closed. It should
     * return true or false. NO - IT RETURNS SOMETHING ELSE! FIX THIS! */
    isCloseOk() {
        if(this.dataDisplay) {
            if(this.dataDisplay.isCloseOk) {
                return this.dataDisplay.isCloseOk();
            }
            
            if(this.inEditMode) {
                return DisplayContainer.UNSAVED_DATA;
            }
        }
        
        return DisplayContainer.CLOSE_OK;
    }
        
    /** This method is called when the member is updated, to make sure the 
    * data display is up to date. */
    componentUpdated(component) {
        if(this.uiDestroyed) return;

        //update the data display
        if(this.dataDisplay) {
            let {reloadData,reloadDataDisplay} = this.dataDisplay.doUpdate();
            if(reloadDataDisplay) {
                //this will also reload data
                this.reloadDataDisplay();
            }
            else if(reloadData) {
                //don't reload data if we are in edit mode. It will reload after completion, whether through cancel or save.
                if(!this.inEditMode) {
                    this.dataDisplay.showData();
                    this.updateViewSizeButtons();
                }
            }
        }
        if(this.errorDisplay) {
            let {reloadData,reloadDataDisplay} = this.errorDisplay.doUpdate();
            if(reloadDataDisplay) {
                //this will also reload data
                this.reloadErrorDisplay();
            }
            else if(reloadData) {
                //(edit mode not supported for error display)
                this.errorDisplay.showData();
            }
        }
    }
        
    //------------------------------
    // Accessed by the Editor, if applicable
    //------------------------------

    onCancel() {
        //reload old data
        this.dataDisplay.showData();
        
        return true;
    }

    startEditMode(onSave,onCancel) {
        if(!this.inEditMode) {
            this.inEditMode = true;
            var saveBar = getSaveBar(onSave,onCancel);
            this.setHeaderContent(saveBar);
            //take additional edit mode actions
            this.mainElement.classList.add("visiui_displayContainer_editMode");
            this.viewSelectorContainer.classList.add("visiui_displayContainer_viewSelectorContainerClass_editMode");
            this.componentDisplay.notifyEditMode(true,this.viewTypeName);

            //save listener for display view
            this.onKeyDown = event => this.keyDownHandler(event,onSave,onCancel);
            this.mainElement.addEventListener("keydown",this.onKeyDown);
        }
    }

    endEditMode() {
        //exit edit mode
        if(this.inEditMode) {
            this.inEditMode = false;
            this.setHeaderContent(null);
            if(this.onKeyDown) {
                this.mainElement.removeEventListener("keydown",this.onKeyDown);
                this.onKeyDown = null;
            }
            this.mainElement.classList.remove("visiui_displayContainer_editMode");
            this.viewSelectorContainer.classList.remove("visiui_displayContainer_viewSelectorContainerClass_editMode");
            this.componentDisplay.notifyEditMode(false,this.viewTypeName);
        }
        //select the associated node in the document.
        let parentComponentView = this.componentView.getParentComponentView();

        //give the editor focus
        parentComponentView.giveEditorFocusIfShowing();

    }

    isInEditMode() {
        return this.inEditMode;
    }


    //====================================
    // Internal Methods
    //====================================

    /** This handles key input */
    keyDownHandler(keyEvent,onSave,onCancel) {
        if((keyEvent.keyCode == 83)&&(keyEvent.ctrlKey)&&(!__OS_IS_MAC__)) {
            if(this.inEditMode) onSave();
            keyEvent.preventDefault();
            return true;
        }
        else if((keyEvent.keyCode == 83)&&(keyEvent.metaKey)&&(__OS_IS_MAC__)) {
            if(this.inEditMode) onSave();
            keyEvent.preventDefault();
            return true;
        }
        else if(keyEvent.keyCode == 27) {
            if(this.inEditMode) onCancel();
            keyEvent.preventDefault();
            return true;
        }
    }

    /** This sets the content for the window. If null (or otherwise false) is passed
     * the content will be set to empty.*/
    setHeaderContent(contentElement) {
        uiutil.removeAllChildren(this.headerContainer);
        if(contentElement) {
            this.headerContainer.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. */
    setDataContent(contentElement) {
        //set the content
        this.viewContainer.appendChild(contentElement);
    }

    /** This sets the content for the window. */
    setErrorContent(contentElement) {
        //set the content
        this.errorContainer.appendChild(contentElement);
    }

}

/** This method returns the main dom element for the window frame. */
PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
PageDisplayContainer.VIEW_OPENED_IMAGE_PATH = "/opened_black.png";



