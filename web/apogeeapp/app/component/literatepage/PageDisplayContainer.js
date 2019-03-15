/** This is a standin for the display conatiner for the literate page
 * 
 * @class 
 */
apogeeapp.app.PageDisplayContainer = function(component, viewType, options) {
	
    //set the options
    if(!options) {
        options = {};
    }
	
    //variables
    this.options = options;
    
    this.mainElement = null;
    this.viewTitleBarElement = null;
    this.componentViewLabelContainer = null;
    this.headerContainer = null;
    this.viewContainer = null;
    
    this.isComponentShowing = false;
    this.isViewActive = false;
    this.isContentLoaded = false;
    
    this.inEditMode = false;
    
    this.content = null;
    
    this.component = component;
    this.viewType = viewType;
    this.dataDisplay = null;
	
    //initialize
    this.initUI();
}

//-------------------
// state management
//-------------------

/** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
apogeeapp.app.PageDisplayContainer.prototype.setIsComponentShowing = function(isComponentShowing) {
    this.isComponentShowing = isComponentShowing;
    this.updateDataDisplayLoadedState();
}

/** This returns the isComponentShowing status of the display. */
apogeeapp.app.PageDisplayContainer.prototype.getIsComponentShowing = function() {
    return this.isComponentShowing;
}

/** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
apogeeapp.app.PageDisplayContainer.prototype.setIsViewActive = function(isViewActive) {
    this.isViewActive = isViewActive;
    //show/hide ui elements
    if(isViewActive) {
        this.mainElement.style.display = ""; 
        this.componentViewLabelContainer.style.display = "none";
    }
    else {
        this.mainElement.style.display = "none"; 
        this.componentViewLabelContainer.style.display = "";
    }
    
    //this lets the data display know if its visibility changes
    this.updateDataDisplayLoadedState();
    
    //fyi - this is remove code, when we need to add it
    //[this.safeRemoveContent(displayElement);]
}

/** This method closes the window. If the argument forceClose is not
 * set to true the "request_close" handler is called to check if
 * it is ok to close the window. */
apogeeapp.app.PageDisplayContainer.prototype.close = function(forceClose) {

    if(!forceClose) {
        //make a close request
        var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
        if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
            //do not close the window
            return;
        }
    }

    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
}

//---------------------------
// GUI ELEMENT
//---------------------------

/** This method returns the view label element to be used in the component title bar. */
apogeeapp.app.PageDisplayContainer.prototype.getViewLabelElement = function() {
    return this.componentViewLabelContainer;
}

/** This method returns the main dom element for the window frame. */
apogeeapp.app.PageDisplayContainer.prototype.getDisplayElement = function() {
    return this.mainElement;
}

//====================================
// Initialization Methods
//====================================

/** This method returns the main dom element for the window frame. */
apogeeapp.app.PageDisplayContainer.COMPONENT_LABEL_EXPAND_BUTTON_PATH = "/expand.png";
apogeeapp.app.PageDisplayContainer.VIEW_TITLE_CONTRACT_BUTTON_PATH = "/contract.png";

/** @private */
apogeeapp.app.PageDisplayContainer.prototype.initUI = function() {
    
    //make the container
    this.mainElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_mainClass",null);
    
    //make the view title bar element
    this.viewTitleBarElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_viewTitleBarClass",this.mainElement);

    this.viewTitleActiveElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_viewTitleActiveClass",this.viewTitleBarElement);
    this.viewTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_viewTitleClass",this.viewTitleBarElement);
    
    this.viewTitleElement.innerHTML = this.viewType;
    
    //make the label for the view in the componennt title bar
    this.componentViewLabelContainer = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_componentViewLabelClass",null);

    this.componentViewActiveElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_componentViewActiveClass",this.componentViewLabelContainer);
    this.componentViewTitleElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_componentViewTitleClass",this.componentViewLabelContainer);
    
    this.componentViewTitleElement.innerHTML = this.viewType;
    

    this.expandImage = apogeeapp.ui.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.componentViewActiveElement);
    this.expandImage.src = apogeeapp.ui.getResourcePath(apogeeapp.app.PageDisplayContainer.COMPONENT_LABEL_EXPAND_BUTTON_PATH);
    this.expandImage.onclick = () => this.setIsViewActive(true);
    this.contractImage = apogeeapp.ui.createElementWithClass("img","visiui_displayContainer_expandContractClass",this.viewTitleActiveElement);
    this.contractImage.src = apogeeapp.ui.getResourcePath(apogeeapp.app.PageDisplayContainer.VIEW_TITLE_CONTRACT_BUTTON_PATH);
    this.contractImage.onclick = () => this.setIsViewActive(false);
    
    //add the header elment (for the save bar)
    this.headerContainer = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);
    
    //add the view container
    this.viewContainer = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_viewContainerClass",this.mainElement);
    
    //TODO - resize element!!!
    
    //set the visibility state for the element
    this.setIsViewActive(this.isViewActive);
}

/** This method shold be called when the content loaded or frame visible state 
 * changes to manage the data display.
 * private */
apogeeapp.app.PageDisplayContainer.prototype.updateDataDisplayLoadedState = function() {
    
    if((this.isComponentShowing)&&(this.isViewActive)) {
        if(!this.dataDisplay) {
            //the display shoudl be created only when it is made visible
            this.dataDisplay =  this.component.getDataDisplay(this,this.viewType);
            this.setContent(this.dataDisplay.getContent(),this.dataDisplay.getContentType());
            this.dataDisplay.showData();
        }
        if(this.dataDisplay.onLoad) this.dataDisplay.onLoad();
    }
    else {
        if(this.dataDisplay) {
            if(this.dataDisplay.onUnload) this.dataDisplay.onUnload();
        }  
    }
}

//------------------------------
// standard methods
//------------------------------

/** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
 * refering to times it is not visible to the user. See further notes in the constructor
 * description. */
apogeeapp.app.PageDisplayContainer.prototype.setDisplayDestroyFlags = function(displayDestroyFlags) {
    alert("Implement setDisplayDestroyFlags!");
}   

/** This method cleasr the data display. It should only be called when the data display is not showing. */
apogeeapp.app.PageDisplayContainer.prototype.forceClearDisplay = function() {
    alert("Implement forceClearDisplay!");
}

/** This method destroys the data display. */
apogeeapp.app.PageDisplayContainer.prototype.destroy = function() {

}

/** This method should be called called before the view mode is closed. It should
 * return true or false. NO - IT RETURNS SOMETHING ELSE! FIX THIS! */
apogeeapp.app.PageDisplayContainer.prototype.isCloseOk = function() {
    if(this.dataDisplay) {
        if(this.dataDisplay.isCloseOk) {
            return this.dataDisplay.isCloseOk();
        }
        
        if(this.inEditMode) {
            return apogeeapp.app.DisplayContainer.UNSAVED_DATA;
        }
    }
    
    return apogeeapp.app.DisplayContainer.CLOSE_OK;
}
    
/** This method is called when the member is updated, to make sure the 
* data display is up to date. */
apogeeapp.app.PageDisplayContainer.prototype.memberUpdated = function() {
    if((this.dataDisplay)&&(!this.inEditMode)) {
        this.dataDisplay.showData();
    }
}
    
//------------------------------
// Accessed by the Editor, if applicable
//------------------------------

apogeeapp.app.PageDisplayContainer.prototype.onCancel = function() {
	//reload old data
	this.dataDisplay.showData();
	
	return true;
}

apogeeapp.app.PageDisplayContainer.prototype.startEditMode = function(onSave,onCancel) {
    if(!this.inEditMode) {
        this.inEditMode = true;
        var saveBar = apogeeapp.app.toolbar.getSaveBar(onSave,onCancel);
        this.setHeaderContent(saveBar);
    }
}

apogeeapp.app.PageDisplayContainer.prototype.endEditMode = function() {
    if(this.inEditMode) {
        this.inEditMode = false;
        this.setHeaderContent(null);
    }
}

apogeeapp.app.PageDisplayContainer.prototype.isInEditMode = function() {
    return this.inEditMode;
}


//====================================
// Internal Methods
//====================================

/** This sets the content for the window. If null (or otherwise false) is passed
 * the content will be set to empty.*/
apogeeapp.app.PageDisplayContainer.prototype.setHeaderContent = function(contentElement) {
    apogeeapp.ui.removeAllChildren(this.headerContainer);
    if(contentElement) {
        this.headerContainer.appendChild(contentElement);
    }
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - for this content, the content is resized to fit the plane frame. The place frame should be initialized with a size.
 *  apogeeapp.ui.FIXED_SIZE - for this content, the plain frame is sized to fit the content. ITs size should not be externally set.
 *  apogeeapp.ui.SIZE_WINDOW_TO_CONTENT - this is not a content type but a input option for content FIXED_SIZE that shrinks the window to fit the content. It is typically only used for dialog boxes so isn't really relevent here.
 */
apogeeapp.app.PageDisplayContainer.prototype.setContent = function(contentElement,elementType) {
    
    apogeeapp.ui.removeAllChildren(this.viewContainer);
    
//    //set the body type
//    var bodyClassName;
//    if(elementType == apogeeapp.ui.RESIZABLE) {
//       bodyClassName = "visiui-dnh-fixed";
//    }
//    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
//        bodyClassName = "visiui-dnh-shrink-to-fit";
//    }
//    else if(elementType == apogeeapp.ui.SIZE_WINDOW_TO_CONTENT) {
//        bodyClassName = "visiui-dnh-shrink-to-fit";
//    }
//    else {
//        throw new Error("Unknown content type: " + elementType);
//    }
//    this.displayAndHeader.setBodyType(bodyClassName);
    
    //set the content
    this.viewContainer.appendChild(contentElement);
    this.content = contentElement;
}

/** This method removes the given element from the content display. If the element
 * is not in the content display, no action is taken. */
apogeeapp.app.PageDisplayContainer.prototype.safeRemoveContent = function(contentElement) {
    for(var i = 0; i < this.bodyCell.childNodes.length; i++) {
		var node = this.bodyCell.childNodes[i];
        if(node === contentElement) {
        	this.bodyCell.removeChild(contentElement);
            this.content = null;
        }
    }
}


