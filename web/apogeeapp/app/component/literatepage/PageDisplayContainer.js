/** This is a standin for the display conatiner for the literate page
 * 
 * @class 
 */
apogeeapp.app.PageDisplayContainer = function(component, viewType, options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    //base init
    apogee.EventManager.init.call(this);
	
    //variables
    this.options = options;

    this.displayAndHeader = null;
    this.headerCell = null;
    this.bodyCell = null;
    
    this.isShowing = false;
    
    this.inEditMode = false;
    
    this.content = null;
    
    this.component = component;
    this.viewType = viewType;
    this.dataDisplay = null;
	
    //initialize
    this.initUI();
}

//add components to this class
apogee.base.mixin(apogeeapp.app.PageDisplayContainer,apogee.EventManager);


//---------------------------
// WINDOW CHILD
//---------------------------

/** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
apogeeapp.app.PageDisplayContainer.prototype.setIsShowing = function(isShowing) {
    if(isShowing) {
        if(!this.isShowing) {
            this.isShowing = true;
            this.dispatchEvent(apogeeapp.app.SHOWN_EVENT,this);
        }
    }
    else if(this.isShowing) {
        this.isShowing = false;
        this.dispatchEvent(apogeeapp.app.HIDDEN_EVENT,this);
    }
}

/** This method should be called if the plain frame container is resized.. */
apogeeapp.app.PageDisplayContainer.prototype.onResize = function() {
    this.dispatchEvent(apogeeapp.app.RESIZED_EVENT,this);
}

/** This method returns true if the window is showing. */
apogeeapp.app.PageDisplayContainer.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method returns the data display. */
apogeeapp.app.PageDisplayContainer.prototype.getDataDisplay = function() {
    return this.dataDisplay;
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

/** This method returns the main dom element for the window frame. */
apogeeapp.app.PageDisplayContainer.prototype.getElement = function() {
    return this.mainDiv;
}

//====================================
// Initialization Methods
//====================================

/** @private */
apogeeapp.app.PageDisplayContainer.prototype.initUI = function() {
    
    this.mainDiv = document.createElement("div");
    
    this.viewTitleDiv = document.createElement("div");
    this.viewTitleDiv.style.padding = "3px";
    this.viewTitleDiv.style.backgroundColor = "lightgray";
    this.viewTitleDiv.innerHTML = this.viewType;
    this.mainDiv.appendChild(this.viewTitleDiv);
    
    this.displayAndHeader = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
        null,
        apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE,
        null
    );
  
    this.headerCell= this.displayAndHeader.getHeaderContainer();  
    this.bodyCell = this.displayAndHeader.getBody();
    this.mainDiv.appendChild(this.displayAndHeader.getOuterElement());
    
    this.bodyCell.style.height = "300px";
    
    //load the content
    this.dataDisplay =  this.component.getDataDisplay(this,this.viewType);
    this.setContent(this.dataDisplay.getContent(),this.dataDisplay.getContentType());  
    
    //fyi - this is remove code, when we need to add it
    //this.safeRemoveContent(displayElement);
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

/** This method shows the data display ion the display component. */
apogeeapp.app.PageDisplayContainer.prototype.setActive = function() {
    alert("Implement setActive!");
}

/** This method hides the data display in the display component. */
apogeeapp.app.PageDisplayContainer.prototype.setInactive = function() {
    alert("Implement setInactive!");
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
	this.setData();
	
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
    apogeeapp.ui.removeAllChildren(this.headerCell);
    if(contentElement) {
        this.headerCell.appendChild(contentElement);
    }
}

/** This sets the content for the window. The content type
 *  can be:
 *  apogeeapp.ui.RESIZABLE - for this content, the content is resized to fit the plane frame. The place frame should be initialized with a size.
 *  apogeeapp.ui.FIXED_SIZE - for this content, the plain frame is sized to fit the content. ITs size should not be externally set.
 *  apogeeapp.ui.SIZE_WINDOW_TO_CONTENT - this is not a content type but a input option for content FIXED_SIZE that shrinks the window to fit the content. It is typically only used for dialog boxes so isn't really relevent here.
 */
apogeeapp.app.PageDisplayContainer.prototype.setContent = function(contentElement,elementType) {
    
    apogeeapp.ui.removeAllChildren(this.bodyCell);
    
    //set the body type
    var bodyClassName;
    if(elementType == apogeeapp.ui.RESIZABLE) {
       bodyClassName = "visiui-dnh-fixed";
    }
    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
        bodyClassName = "visiui-dnh-shrink-to-fit";
    }
    else if(elementType == apogeeapp.ui.SIZE_WINDOW_TO_CONTENT) {
        bodyClassName = "visiui-dnh-shrink-to-fit";
    }
    else {
        throw new Error("Unknown content type: " + elementType);
    }
    this.displayAndHeader.setBodyType(bodyClassName);
    
    //set the content
    this.bodyCell.appendChild(contentElement);
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


