import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManager.js";

/** This is a plain div that holds content similar to a window frame
 * but it does not have a outer frame and does not go in a window parent.
 * 
 * @class 
 */
apogeeapp.ui.PlainFrame = function(options) {
	
    //set the options
    if(!options) {
        options = {};
    }
    
    //base init
    EventManager.init.call(this);
	
    //variables
    this.options = options;

    this.displayAndHeader = null;
    this.headerCell = null;
    this.bodyCell = null;
    
    this.isShowing = false;
    
    this.content = null;
	
    //initialize
    this.initUI();
}

//add components to this class
base.mixin(apogeeapp.ui.PlainFrame,EventManager);

//====================================
// Public Methods
//====================================

/** This sets the content for the window. If null (or otherwise false) is passed
 * the content will be set to empty.*/
apogeeapp.ui.PlainFrame.prototype.setHeaderContent = function(contentElement) {
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
apogeeapp.ui.PlainFrame.prototype.setContent = function(contentElement,elementType) {
    
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
apogeeapp.ui.PlainFrame.prototype.safeRemoveContent = function(contentElement) {
    for(var i = 0; i < this.bodyCell.childNodes.length; i++) {
		var node = this.bodyCell.childNodes[i];
        if(node === contentElement) {
        	this.bodyCell.removeChild(contentElement);
            this.content = null;
        }
    }
}



//---------------------------
// WINDOW CHILD
//---------------------------

/** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
apogeeapp.ui.PlainFrame.prototype.setIsShowing = function(isShowing) {
    if(isShowing) {
        if(!this.isShowing) {
            this.isShowing = true;
            this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
        }
    }
    else if(this.isShowing) {
        this.isShowing = false;
        this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
    }
}

/** This method should be called if the plain frame container is resized.. */
apogeeapp.ui.PlainFrame.prototype.onResize = function() {
    this.dispatchEvent(apogeeapp.ui.RESIZED_EVENT,this);
}

/** This method returns true if the window is showing. */
apogeeapp.ui.PlainFrame.prototype.getIsShowing = function() {
    return this.isShowing;
}

/** This method closes the window. If the argument forceClose is not
 * set to true the "request_close" handler is called to check if
 * it is ok to close the window. */
apogeeapp.ui.PlainFrame.prototype.close = function(forceClose) {

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
apogeeapp.ui.PlainFrame.prototype.getElement = function() {
    return this.displayAndHeader.getOuterElement();
}


//----------------------------------------------------------------
//object specific


/** This method gets the location and size info for the window. */
apogeeapp.ui.PlainFrame.prototype.getWindowState = function() {
    return apogeeapp.ui.WINDOW_STATE_NORMAL;
}

//====================================
// Initialization Methods
//====================================

/** @private */
apogeeapp.ui.PlainFrame.prototype.initUI = function() {
    
    this.displayAndHeader = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
        null,
        apogeeapp.ui.DisplayAndHeader.SCROLLING_PANE,
        null
    );
  
    this.headerCell= this.displayAndHeader.getHeaderContainer();  
    this.bodyCell = this.displayAndHeader.getBody();
    
}

