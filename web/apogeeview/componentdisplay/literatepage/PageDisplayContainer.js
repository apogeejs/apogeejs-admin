import {getSaveBar} from "/apogeeview/componentdisplay/toolbar.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";

/** This is a standin for the display conatiner for the literate page
 * 
 * @class 
 */
export default class PageDisplayContainer {

    constructor(componentView, viewType, isMainView) {
        
        //variables
        this.isMainView = isMainView;
        
        this.mainElement = null;
        this.viewLabelHeaderElement = null;
        this.viewLabelElement = null;
        this.headerContainer = null;
        this.viewContainer = null;

        this.viewSelectorContainer = null;
        this.viewActiveElement = null;
        this.viewNameElement = null;

        this.uiCompleted = false;
        
        this.isComponentShowing = false;
        this.isViewActive = isMainView;
        this.isContentLoaded = false;
        
        this.destroyViewOnInactive = true;
        
        this.inEditMode = false;
        
        this.content = null;
        
        this.componentView = componentView;
        this.viewType = viewType;
        this.dataDisplay = null;

        this.heightUiActive = false;
        this.showLessButton = null;
        this.showMoreButton = null;
        this.showMaxButton = null;

        this.savedUiState = {};
        
        //initialize
        this.initUI();
    }

    getComponentView() {
        return this.componentView;
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

    /** This method closes the window. If the argument forceClose is not
     * set to true the "request_close" handler is called to check if
     * it is ok to close the window. */
    close(forceClose) {

        if(!forceClose) {
            //make a close request
            var requestResponse = this.callHandler(uiutil.REQUEST_CLOSE,this);
            if(requestResponse == uiutil.DENY_CLOSE) {
                //do not close the window
                return;
            }
        }

        this.dispatchEvent(uiutil.CLOSE_EVENT,this);
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

        //make the selector for the view, in the component title bar
        this.viewSelectorContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorContainerClass",null);

        this.viewActiveElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewActiveElementClass",this.viewSelectorContainer);
        this.viewNameElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorClass",this.viewSelectorContainer);
        
        this.viewNameElement.innerHTML = this.viewType;

        this.expandImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.viewActiveElement);
        this.expandImage.src = uiutil.getResourcePath(PageDisplayContainer.COMPONENT_LABEL_EXPAND_BUTTON_PATH);
    
        this.contractImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.viewActiveElement);
        this.contractImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_TITLE_CONTRACT_BUTTON_PATH);

        this.viewSelectorContainer.onclick = () => this.setIsViewActive(!this.isViewActive);
        
        this.updateViewSelectorState();
    }

    /** This completes the UI. It should only be called when the data display has been created. */
    completeUI() {

        if(!this.dataDisplay) return;
        
        //make the label for the view
        this.viewLabelHeaderElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewLabelHeaderClass",this.mainElement);

        this.viewLabelElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewLabelClass",this.viewLabelHeaderElement);
        this.viewLabelElement.innerHTML = this.viewType;

        this.viewToolbarElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewToolbarClass",this.viewLabelHeaderElement);

        //add the view toolbar controls
        this.populateViewToolbar();
        
        //add the header elment (for the save bar)
        this.headerContainer = uiutil.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);
        
        //add the view container
        let viewContainerClass = this.dataDisplay.getSupressContainerHorizontalScroll() ? 
            "visiui_displayContainer_viewContainerClass_noHScroll" : "visiui_displayContainer_viewContainerClass";
        this.viewContainer = uiutil.createElementWithClass("div",viewContainerClass,this.mainElement);

        this.uiCompleted = true;
    }

    /** This undoes the data display specific parts of the container ui */
    uncompleteUI() {
        uiutil.removeAllChildren(this.mainElement);
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
    populateViewToolbar() {
        if(this.dataDisplay.getUseContainerHeightUi()) {
            this.showLessButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.viewToolbarElement);
            this.showLessButton.innerHTML = "less";
            this.showLessButton.onclick = () => this.showLess();
            this.showMoreButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.viewToolbarElement);
            this.showMoreButton.innerHTML = "more";
            this.showMoreButton.onclick = () => this.showMore();
            this.showMaxButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass",this.viewToolbarElement);
            this.showMaxButton.innerHTML = "max";
            this.showMaxButton.onclick = () => this.showMax();
            this.heightUiActive = true;
            this.updateViewSizeButtons()
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
                    this.dataDisplay =  this.componentView.getDataDisplay(this,this.viewType);
                    this.dataDisplay.readUiStateData(this.savedUiState);
                    if(!this.uiCompleted) this.completeUI();
                    this.setContent(this.dataDisplay.getContent());
                    this.dataDisplay.showData();
                }
            
                if(this.dataDisplay.onLoad) this.dataDisplay.onLoad();
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
        this.destroy();

        //this gets rid of the data display specific parts of the ui
        this.uncompleteUI();

        //reload display
        this.updateDataDisplayLoadedState();
    }

    /** This method destroys the data display. */
    destroy() {
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
        //update the data display
        if((this.dataDisplay)&&(!this.inEditMode)) {
            let {reloadData,reloadDataDisplay} = this.dataDisplay.doUpdate();
            if(reloadDataDisplay) {
                this.reloadDisplay();
            }
            else if(reloadData) {
                this.dataDisplay.showData();
                this.updateViewSizeButtons();
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
        }
    }

    endEditMode() {
        //exit edit mode
        if(this.inEditMode) {
            this.inEditMode = false;
            this.setHeaderContent(null);
        }
        //select the associated node in the document.
        let parentComponentView = this.componentView.getParentComponentView();

        //OMIT THIS FOR NOW
        // if(parentComponentView) {
        //     let name = this.componentView.getComponent().getName();
        //     let commandData = parentComponentView.getSelectApogeeNodeCommand(name);
        //     if(commandData) {
        //         ???
        //     }
        // }

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
PageDisplayContainer.COMPONENT_LABEL_EXPAND_BUTTON_PATH = "/closed_gray.png";
PageDisplayContainer.VIEW_TITLE_CONTRACT_BUTTON_PATH = "/opened_gray.png";



