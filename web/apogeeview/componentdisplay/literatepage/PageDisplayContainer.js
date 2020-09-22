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

        this.viewSelectorContainer = null;
        this.viewActiveElement = null;
        this.viewNameElement = null;
        
        this.isComponentShowing = false;
        this.isViewActive = viewModeInfo.isActive;
        this.isContentLoaded = false;
        
        this.destroyViewOnInactive = true;
        
        this.inEditMode = false;
        
        this.content = null;
        
        this.componentDisplay = componentDisplay;
        this.componentView = componentDisplay.getComponentView();
        this.viewTypeName = viewModeInfo.name;
        this.viewTypeLabel = viewModeInfo.label;
        this.dataDisplay = null;

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

        this.viewLabelElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewLabelClass",this.viewToolbarElement);
        this.viewLabelElement.innerHTML = this.viewTypeLabel;

        this.sizingElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewSizingElementClass",this.viewToolbarElement);

        //create the view display
        this.viewDisplayElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplayBarClass",this.viewToolbarElement);
        
        //add the header elment (for the save bar)
        this.headerContainer = uiutil.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);

        //add the view container
        this.viewContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewContainerClass",this.mainElement);

        //make the selector for the view, displayed in the component title bar
        this.viewSelectorContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorContainerClass",null);
        this.viewSelectorLink = uiutil.createElementWithClass("a","visiui_displayContainer_viewSelectorLinkClass",this.viewSelectorContainer);

        this.expandImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.viewSelectorLink);
        this.expandImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH);
    
        this.contractImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.viewSelectorLink);
        this.contractImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_OPENED_IMAGE_PATH);

        this.viewNameElement = uiutil.createElementWithClass("span","visiui_displayContainer_viewSelectorClass",this.viewSelectorLink);
        this.viewNameElement.innerHTML = this.viewTypeLabel;

        this.viewSelectorLink.href = "javascript:void(0)";
        this.viewSelectorLink.onclick = () => this.setIsViewActive(!this.isViewActive);

        this.updateViewSelectorState();
    }

    /** This tears down any elements created in UI initialization */
    destroyUI() {
        if(!this.uiDestrpoyed) {
            this.uiDestroyed = true;

            this.mainElement = null;
            this.viewToolbarElement = null;
            this.viewLabelElement = null;

            this.sizingElement = null;

            this.viewDisplayElement = null;
            this.headerContainer = null;
            this.viewContainer = null;
            this.viewSelectorContainer = null;

            if(this.viewSelectorLink) {
                this.viewSelectorLink.onclick = null;
                this.viewSelectorLink = null;
            }

            this.expandImage = null;
            this.contractImage = null;

            this.viewNameElement = null;
        }
    }

    /** This completes the UI. It should only be called when the data display has been created. */
    completeUI() {
        if(!this.dataDisplay) return;
        if(this.uiDestroyed) return;

        //add the view toolbar controls
        this.populateSizingElement();

        //populating the display element is initiated by the data display itself

        this.uiCompleted = true;
    }

    /** This clears the data display specific parts of the container ui, so a new data display may be added. */
    uncompleteUI() {
        if(this.uiDestroyed) return;

        if(this.showLessButton) this.showLessButton.onclick = null;
        if(this.showMoreButton) this.showMoreButton.onclick = null;
        if(this.showMaxButton) this.showMaxButton.onclick = null;
        uiutil.removeAllChildren(this.sizingElement);
        uiutil.removeAllChildren(this.viewDisplayElement);
        uiutil.removeAllChildren(this.viewContainer);

        this.heightUiActive = false;

        this.uiCompleted = false;
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
    populateSizingElement() {

        //show the height controls
        if(this.dataDisplay.getUseContainerHeightUi()) {
            this.showLessButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.sizingElement);
            this.showLessButton.innerHTML = "less";
            this.showLessButton.onclick = () => this.showLess();
            this.showLessButton.title = "Descrease View Size";
            this.showMoreButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.sizingElement);
            this.showMoreButton.innerHTML = "more";
            this.showMoreButton.onclick = () => this.showMore();
            this.showMoreButton.title = "Increase View Size";
            this.showMaxButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.sizingElement);
            this.showMaxButton.innerHTML = "max";
            this.showMaxButton.onclick = () => this.showMax();
            this.showMaxButton.title = "Show Max View Size";
            this.heightUiActive = true;
            this.updateViewSizeButtons()
        }
        else {
            this.sizingElement.style.display = "none";
        }
    }

    showLess() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX) {
                //if we are in display max mode, change to display some mode
                this.dataDisplay.setResizeHeightMode(DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME);
            }
            else if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
                //if we are in "some" mode, adjust size smaller if allowed
                if((this.dataDisplay.getHeightAdjustFlags() | DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS) !== 0) {                  
                    this.dataDisplay.adjustHeight(DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS);
                }
            }
            else {
                //unknown mode
                return;
            }
            this.updateViewSizeButtons();
        }
    }

    showMore() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
                //if we are in "some" mode, adjust size smaller if allowed
                if((this.dataDisplay.getHeightAdjustFlags() | DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE) !== 0) {
                    this.dataDisplay.adjustHeight(DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE);
                }
            }
            else {
                //no action is not in some mode
                return;
            }
            this.updateViewSizeButtons();
        }
    }

    showMax() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
                //if we are in display max mode, change to display some mode
                this.dataDisplay.setResizeHeightMode(DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX);
            }
            else {
                //no action is not in some mode
                return;
            }
            this.updateViewSizeButtons();
        }
    }

    updateViewSizeButtons() {
        if(this.heightUiActive) {
            let showLessVisible = false, showMoreVisible = false, showMaxVisible = false;
            if(this.dataDisplay) {
                if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
                    showLessVisible = true;
                    showMoreVisible = true;
                    showMaxVisible = true;
                }
                else if(this.dataDisplay.getResizeHeightMode() == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX){
                    showLessVisible = true;
                }
            }

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
                        if(!this.uiCompleted) this.completeUI();
                        this.setContent(this.dataDisplay.getContent());
                        this.dataDisplay.showData();
                    }
                }
            
                if((this.dataDisplay)&&(this.dataDisplay.onLoad)) this.dataDisplay.onLoad();
                this.dataDisplayLoaded = true;
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

                    //remove content
                    this.safeRemoveContent();
                    //destroy the display
                    if(this.dataDisplay.destroy) this.dataDisplay.destroy();
                    this.dataDisplay = null;
                }
            }  
        }
        
            
        //fyi - this is remove code, when we need to add it
        //[]
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
    reloadDisplay() {

        //update the stored UI state json
        this.savedUiState = this.getStateJson();

        //this destrpys the data display, not the container - bad name
        this.deleteDataDisplay();

        //this gets rid of the data display specific parts of the ui
        this.uncompleteUI();

        //reload display
        this.updateDataDisplayLoadedState();
    }

    /** This method destroys the data display. */
    destroy() {
        this.uncompleteUI();
        this.destroyUI();
        this.deleteDataDisplay();
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
                this.reloadDisplay();
            }
            else if(reloadData) {
                //don't reload data if we are in edit mode. It will reload after completion, whether through cancel or save.
                if(!this.inEditMode) {
                    this.dataDisplay.showData();
                    this.updateViewSizeButtons();
                }
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
        }
    }

    endEditMode() {
        //exit edit mode
        if(this.inEditMode) {
            this.inEditMode = false;
            this.setHeaderContent(null);
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

    /** This sets the content for the window. If null (or otherwise false) is passed
     * the content will be set to empty.*/
    setHeaderContent(contentElement) {
        uiutil.removeAllChildren(this.headerContainer);
        if(contentElement) {
            this.headerContainer.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. */
    setContent(contentElement) {
        
        uiutil.removeAllChildren(this.viewContainer);
        
        //set the content
        this.viewContainer.appendChild(contentElement);
        this.content = contentElement;
    }

    /** This method removes the given element from the content display. If the element
     * is not in the content display, no action is taken. */
    safeRemoveContent() {
        for(var i = 0; i < this.viewContainer.childNodes.length; i++) {
            var node = this.viewContainer.childNodes[i];
            if(node === this.content) {
                this.viewContainer.removeChild(this.content);
                this.content = null;
            }
        }
    }

}

/** This method returns the main dom element for the window frame. */
PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
PageDisplayContainer.VIEW_OPENED_IMAGE_PATH = "/opened_black.png";



