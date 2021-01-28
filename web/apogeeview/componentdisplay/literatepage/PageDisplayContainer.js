import {getSaveBar} from "/apogeeview/componentdisplay/toolbar.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil,getHelpElement} from "/apogeeui/apogeeUiLib.js";

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
        this.viewHeadingElement = null;
        this.headerContainer = null;
        this.messageContainer = null;
        this.viewContainer = null;
        this.viewDisplayElement = null;

        this.viewSelectorContainer = null;
        this.viewActiveElement = null;
        this.viewNameElement = null;

        this.hasViewSourceText = false;
        this.viewSource = null;
        
        this.isComponentShowing = false;
        this.isViewActive = viewModeInfo.isActive;
        this.isViewRemoved = viewModeInfo.isTransient; //start removed for transient displays
        this.isViewHidden = false;
        this.message = "";
        this.messageType = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE;  //start with an empty message
        this.isContentLoaded = false;
        
        this.destroyViewOnInactive = true;
        
        this.inEditMode = false;
        
        this.componentDisplay = componentDisplay;
        this.componentView = componentDisplay.getComponentView();
        this.viewTypeName = viewModeInfo.name;
        this.viewTypeLabel = viewModeInfo.label;

        this.dataDisplay = null;
        this.dataDisplayLoaded = false;

        this.heightUiActive = false;
        this.showLessButton = null;
        this.showMoreButton = null;
        this.showMaxButton = null;

        this.savedUiState = {};

        this.uiCompleted = false;
        this.uiDestroyed = false;
        
        //initialize
        this._initUI();
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
        this._updateDataDisplayLoadedState();
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
            this._setIsViewActive(this.savedUiState.isViewActive);
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

    //------------------------------
    // standard methods
    //------------------------------

    /** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
     * refering to times it is not visible to the user. See further notes in the constructor
     * description. */
    setDestroyViewOnInactive(destroyViewOnInactive) {
        this.destroyViewOnInactive = destroyViewOnInactive;
    }   

    /** This method destroys the data display. */
    destroy() {
        this._destroyUI();
        this._deleteDataDisplay();
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
                this._reloadDataDisplay();
            }
            else if(reloadData) {
                this._updateDataDisplay();
            }
        }

        //update name label on view heading if needed
        if((this.hasViewSourceText)&&(this.componentView.getComponent().isMemberFieldUpdated("member","name"))) {
            this.viewSource.innerHTML = this._getViewSourceText();
        }
    }


    //-----------------------------
    // Accessed by the data display
    //------------------------------

    setHideDisplay(doHide) {
        if(doHide != this.isViewHidden) {
            this.isViewHidden = doHide;
            this._updateViewState();
        }
    }

    getDisplayHidden() {
        return this.isViewHidden;
    }

    setRemoveView(doRemove) {
        if(doRemove != this.isViewRemoved) {
            this.isViewRemoved = doRemove;
            this._updateViewState();
        }
    }

    getViewRemoved() {
        return this.isViewRemoved;
    }

    setMessage(messageType,message) {
        this.messageType = messageType;

        this.messageContainer.className = MESSAGE_CONTAINER_BASE_CLASS;
        let messageTypeClass = MESSAGE_TYPE_CLASS_MAP[messageType];
        if(!messageTypeClass) messageTypeClass = DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE;

        this.messageContainer.classList.add(messageTypeClass);

        this.message = (this.messageType != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE) ? message : "";
        this.messageContainer.innerHTML = this.message;
    }

    getMessageType() {
        return this.messageType;
    }

    getMessage() {
        return this.message;
    }

    //edit mode methods

    onCancel() {
        //reload old data
        this.dataDisplay.showData();
        
        return true;
    }

    startEditMode(onSave,onCancel) {
        if(!this.inEditMode) {
            this.inEditMode = true;
            var saveBar = getSaveBar(onSave,onCancel);
            this._setHeaderContent(saveBar);
            //take additional edit mode actions
            this.mainElement.classList.add("visiui_displayContainer_editMode");
            this.viewSelectorContainer.classList.add("visiui_displayContainer_viewSelectorContainerClass_editMode");
            this.componentDisplay.notifyEditMode(true,this.viewTypeName);

            //save listener for display view
            this.onKeyDown = event => this._keyDownHandler(event,onSave,onCancel);
            this.mainElement.addEventListener("keydown",this.onKeyDown);
        }
    }

    endEditMode() {
        //exit edit mode
        if(this.inEditMode) {
            this.inEditMode = false;
            this._setHeaderContent(null);
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
        if(parentComponentView) {
            //give the editor focus
            parentComponentView.giveEditorFocusIfShowing();
        }

    }

    isInEditMode() {
        return this.inEditMode;
    }



    //====================================
    // Private Methods
    //====================================

    /** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
    _setIsViewActive(isViewActive) {
        this.isViewActive = isViewActive;
        this._updateViewState();
        this._updateDataDisplayLoadedState();
    }

    /** @private */
    _initUI() {
        
        //make the container
        this.mainElement = uiutil.createElementWithClass("div","visiui_displayContainer_mainClass",null);

        //create the view header
        this.viewToolbarElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewToolbarClass",this.mainElement);
        
        //create the heading element and its content
        this.viewHeadingElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewHeadingClass",this.viewToolbarElement);
        let {viewTitleText,hasViewSourceText,viewTypeText,viewTypeClassName,viewDescText} = this._getViewHeadingInfo();

        let viewTitleElement = uiutil.createElementWithClass("span","visiui_displayContainer_viewTitleClass",this.viewHeadingElement);
        viewTitleElement.innerHTML = viewTitleText;

        this.hasViewSourceText = hasViewSourceText;
        if(hasViewSourceText) {
            //this is saved so we can update the name if it changes
            this.viewSource = uiutil.createElementWithClass("span","visiui_displayContainer_viewSourceClass",this.viewHeadingElement);
            this.viewSource.innerHTML = this._getViewSourceText();
        }
        if(viewTypeText) {
            let viewType = uiutil.createElementWithClass("span",viewTypeClassName,this.viewHeadingElement);
            viewType.innerHTML = viewTypeText;
        }
        if(viewDescText) {
            //NOTE - I probably need to add some options!!!
            let options = {
                wrapperAddonClass: "visiui_displayContainer_HelpWrapperAddon",
                imageAddonClass: "visiui_displayContainer_HelpImageAddon",
                textAddonClass: "visiui_displayContainer_HelpTextAddon"
            };
            if(viewDescText.length > 24) {
                options.textWidth = "300px";
            }
            let helpElements = getHelpElement(viewDescText,options);
            this.viewHeadingElement.appendChild(helpElements.wrapperElement);
        }

        this.sizingElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewSizingElementClass",this.viewToolbarElement);

        //create the view display
        this.viewDisplayElement = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplayBarClass",this.viewToolbarElement);
        
        //add the header elment (for the save bar)
        this.headerContainer = uiutil.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);

        //add the message element
        this.messageContainer = uiutil.createElementWithClass("div","visiui_displayContainer_messageContainerClass",this.mainElement);

        //add the view container
        this.viewContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewContainerClass",this.mainElement);

        //make the selector for the view, displayed in the component title bar
        this.viewSelectorContainer = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorContainerClass",null);
        if(this.viewModeInfo.isInfoView) {
            this.viewSelectorContainer.classList.add("visiui_displayContainer_viewSelectorContainerClass_info");
        }
        //this is set from link to div so it can not get focus. later, we _do_ want it to get focuus, but if it does we need to make
        //sure button presses are handled properly. (as it would have been, enter does not work to leave the cell)
        this.viewSelectorLink = uiutil.createElementWithClass("div","visiui_displayContainer_viewSelectorLinkClass visiui_hideSelection",this.viewSelectorContainer);

        this.expandImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass visiui_hideSelection",this.viewSelectorLink);
        this.expandImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH);
    
        this.contractImage = uiutil.createElementWithClass("img","visiui_displayContainer_expandContractClass visiui_hideSelection",this.viewSelectorLink);
        this.contractImage.src = uiutil.getResourcePath(PageDisplayContainer.VIEW_OPENED_IMAGE_PATH);

        this.viewNameElement = uiutil.createElementWithClass("span","visiui_displayContainer_viewSelectorClass visiui_hideSelection",this.viewSelectorLink);
        this.viewNameElement.innerHTML = this.viewTypeLabel;

        this.viewSelectorLink.onclick = () => { this._setIsViewActive(!this.isViewActive); return false; }

        //set initial state
        this.setMessage(this.messageType,this.message);
        this._updateViewState();
    }

    /** This tears down any elements created in UI initialization */
    _destroyUI() {
        if(!this.uiDestrpoyed) {
            this.uiDestroyed = true;

            if(this.onKeyDown) {
                this.mainElement.removeEventListener("keyDown",this.onKeyDown);
                this.onKeyDown = null;
            }
            this.mainElement = null;
            this.viewToolbarElement = null;
            this.viewHeadingElement = null;

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

            if(this.viewSelectorLink) {
                this.viewSelectorLink.onclick = null;
                this.viewSelectorLink = null;
            }

            this.expandImage = null;
            this.contractImage = null;

            this.viewNameElement = null;
        }
    }

    _updateViewState() {
        //show/hide ui elements
        if(this.isViewRemoved) {
            this.mainElement.style.display = "none";
            this.viewSelectorContainer.style.display = "none";
        }
        else if(this.isViewActive) { 
            this.viewSelectorContainer.style.display = "";
            this.expandImage.style.display = "none";
            this.contractImage.style.display = "";
            this.mainElement.style.display = "";
            if(this.isViewHidden) {
                this.viewContainer.style.display = "none";
            }
            else {
                this.viewContainer.style.display = "";
            }
        }
        else {
            this.viewSelectorContainer.style.display = "";
            this.expandImage.style.display = "";
            this.contractImage.style.display = "none";
            this.mainElement.style.display = "none";
        }
    }

    /** This method clears the data display. It should only be called when the data display is not showing. 
     * maybe allow this when the display is showing - unload and reload it*/
    _reloadDataDisplay() {

        //update the stored UI state json
        this.savedUiState = this.getStateJson();

        //reset any data display specific parts of the ui
        this._cleanupDataDisplayUI();

        //this destrpys the data display, not the container - bad name
        this._deleteDataDisplay();

        //reload display
        this._updateDataDisplayLoadedState();
    }

    _getViewHeadingInfo() {
        let viewTitleText = this.viewModeInfo.label;
        if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_FUNCTION) {
            let argList = (this.viewModeInfo.argList !== undefined) ? this.viewModeInfo.argList : "";
            viewTitleText += "(" + argList + ")";
        }

        let hasViewSourceText = (this.viewModeInfo.sourceLayer == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_LAYER_MODEL);
        
        let viewTypeText;
        let viewTypeClassName;
        if(this.viewModeInfo.sourceLayer == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_LAYER_MODEL) {
            if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_DATA) {
                viewTypeText = SOURCE_TYPE_MODEL_DATA_LABEL;
            }
            else if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_FUNCTION) {
                viewTypeText = SOURCE_TYPE_MODEL_CODE_LABEL;
            }
            else if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_PRIVATE_CODE) {
                viewTypeText = SOURCE_TYPE_MODEL_PRIVATE_CODE_LABEL;
            }
            viewTypeClassName = "visiui_displayContainer_viewTypeModelClass";
        }
        else if(this.viewModeInfo.sourceLayer == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_LAYER_APP) {
            if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_DATA) {
                viewTypeText = SOURCE_TYPE_APP_DATA_LABEL;
            }
            else if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_FUNCTION) {
                viewTypeText = SOURCE_TYPE_APP_CODE_LABEL;
            }
            else if(this.viewModeInfo.sourceType == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_TYPE_OTHER_CODE) {
                viewTypeText = SOURCE_TYPE_APP_CODE_LABEL;
            }
            viewTypeClassName = "visiui_displayContainer_viewTypeAppClass";
        }

        let viewDescText;
        if(this.viewModeInfo.description) {
            viewDescText = this.viewModeInfo.description;
        }

        return {viewTitleText,hasViewSourceText,viewTypeText,viewTypeClassName,viewDescText};
    }

    _getViewSourceText() {
        let viewSourceText;
        if(this.viewModeInfo.sourceLayer == DATA_DISPLAY_CONSTANTS.VIEW_SOURCE_LAYER_MODEL) {
            viewSourceText = this.componentView.getName();
            if(this.viewModeInfo.suffix) viewSourceText += this.viewModeInfo.suffix;
        }
        else {
            viewSourceText = "";
        }
        return viewSourceText;
    }

    /** This method configures the toolbar for the view display. */
    _configureSizingElement() {

        //show the height controls
        if(this.dataDisplay.getUseContainerHeightUi()) {

            if(!this.showLessButton) { //use this as a proxy for other two
                this.showLessButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showLessButton.innerHTML = "less";
                this.showLessButton.onclick = () => this._showLess();
                this.showLessButton.title = "Descrease View Size";
                this.showMoreButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showMoreButton.innerHTML = "more";
                this.showMoreButton.onclick = () => this._showMore();
                this.showMoreButton.title = "Increase View Size";
                this.showMaxButton = uiutil.createElementWithClass("div","visiui_displayContainer_viewDisplaySizeButtonClass visiui_hideSelection",this.sizingElement);
                this.showMaxButton.innerHTML = "max";
                this.showMaxButton.onclick = () => this._showMax();
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

    _showLess() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showLess();
            this._updateViewSizeButtons();
        }
    }

    _showMore() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showMore();
            this._updateViewSizeButtons();
        }
    }

    _showMax() {
        if((this.dataDisplay)&&(this.heightUiActive)) {
            this.dataDisplay.showMax();
            this._updateViewSizeButtons();
        }
    }

    _updateViewSizeButtons() {
        if(this.heightUiActive) {
            let showLessVisible = false, showMoreVisible = false, showMaxVisible = false;
            if((this.dataDisplay)&&(!this.isViewHidden)) {
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
    _updateDataDisplayLoadedState() {
        
        if((this.isComponentShowing)&&(this.isViewActive)) {
            if(!this.dataDisplayLoaded) {
                if(!this.dataDisplay) {
                    //the display should be created only when it is made visible
                    this.dataDisplay =  this.componentView.getDataDisplay(this,this.viewTypeName);
                    if(this.dataDisplay) {
                        this.dataDisplay.readUiStateData(this.savedUiState);
                        this._setDataContent(this.dataDisplay.getContent());
                        this._configureSizingElement();
                        this._updateDataDisplay();
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
                //but don't destroy a traniesnt display. It needs to be there to decide if it should be shown or hidden
                if((this.destroyViewOnInactive)&&(!this.isViewActive)&&(!this.viewModeInfo.isTransient)) {
                    //update the saved UI state
                    this.dataDisplay.addUiStateData(this.savedUiState);

                    this._cleanupDataDisplayUI();

                    //destroy the display
                    if(this.dataDisplay.destroy) this.dataDisplay.destroy();
                    this.dataDisplay = null;
                }
            }  
        }
        this._updateViewSizeButtons();
    }

    

    _updateDataDisplay() {
        //don't reload data if we are in edit mode. It will reload after completion, whether through cancel or save.
        if(this.inEditMode) return;

        this.dataDisplay.showData();
        this._updateViewSizeButtons();
    }

    _cleanupDataDisplayUI() {
        //reset any data display specific parts of the ui
        this.sizingElement.style.display = "none";
        this.heightUiActive = false;
        uiutil.removeAllChildren(this.viewDisplayElement);
        uiutil.removeAllChildren(this.viewContainer);
    }

    _deleteDataDisplay() {
        if(this.dataDisplay) {
            if(this.dataDisplay.destroy) {
                this.dataDisplay.destroy();
            }
            this.dataDisplay = null;
            this.dataDisplayLoaded = false;
        }
    }

    //====================================
    // Internal Methods
    //====================================

    /** This handles key input */
    _keyDownHandler(keyEvent,onSave,onCancel) {
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
    _setHeaderContent(contentElement) {
        uiutil.removeAllChildren(this.headerContainer);
        if(contentElement) {
            this.headerContainer.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. */
    _setDataContent(contentElement) {
        //set the content
        this.viewContainer.appendChild(contentElement);
    }

}

/** This method returns the main dom element for the window frame. */
PageDisplayContainer.VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
PageDisplayContainer.VIEW_OPENED_IMAGE_PATH = "/opened_black.png";

const MESSAGE_CONTAINER_BASE_CLASS = "visiui_displayContainer_messageContainerClass";

const MESSAGE_TYPE_CLASS_MAP = {
    "none": "visiui_displayContainer_messageNone",
    "error": "visiui_displayContainer_messageError",
    "warning": "visiui_displayContainer_messageWarning",
    "info": "visiui_displayContainer_messageInfo"
}


const SOURCE_TYPE_MODEL_DATA_LABEL = "data";
const SOURCE_TYPE_MODEL_CODE_LABEL = "code";
const SOURCE_TYPE_MODEL_PRIVATE_CODE_LABEL = "private code";
const SOURCE_TYPE_APP_DATA_LABEL = "UI data";
const SOURCE_TYPE_APP_CODE_LABEL = "UI code - no access to other cells";



