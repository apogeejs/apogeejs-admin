/** This is the main apogeeapp ui file */
apogeeapp.ui = {};

/** This should be called to initializethe resource path. */
apogeeapp.ui.initResourcePath = function(resourceDirectory) {
    apogeeapp.ui.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
apogeeapp.ui.getResourcePath = function(relativePath) {
    return apogeeapp.ui.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
apogeeapp.ui.MENU_ZINDEX = 100;
apogeeapp.ui.WINDOW_FRAME_ZINIDEX = 10;
apogeeapp.ui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

apogeeapp.ui.idIndex = 0;
apogeeapp.ui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
apogeeapp.ui.createId = function() {
    return apogeeapp.ui.idBase + apogeeapp.ui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
apogeeapp.ui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// resources
//=========================================

apogeeapp.ui.MINIMIZE_CMD_IMAGE = "/minimize.png";
apogeeapp.ui.RESTORE_CMD_IMAGE = "/restore.png";
apogeeapp.ui.MAXIMIZE_CMD_IMAGE = "/maximize.png";
apogeeapp.ui.CLOSE_CMD_IMAGE = "/close_gray.png";
apogeeapp.ui.MENU_IMAGE = "/hamburger.png";

//=========================================
// dom methods
//=========================================


/** This method removes all the content from a DOM element. */
apogeeapp.ui.removeAllChildren = function(element) {
	while(element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

/** This method applies the style json to the dom element. All arguments
 * besides type are optional.
 * 
 * type is the element type
 * properties are javascript properties, 
 * styleProperties are the style properties
 * */
apogeeapp.ui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        apogeeapp.ui.applyStyle(element,styleProperties);
    }
    return element;
}

/** This method creates a DOM element of the given type, sets the class name
 * and, if present, adds it to the given parent. */
apogeeapp.ui.createElementWithClass = function(elementType,className,parent) {
    var element = document.createElement(elementType);
    element.className = className;
    if(parent) parent.appendChild(element);
    return element;
}

//=========================================
// window and dialog methods
//=========================================

apogeeapp.ui.dialogLayer = null;

apogeeapp.ui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

apogeeapp.ui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

apogeeapp.ui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
apogeeapp.ui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw apogee.base.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = apogeeapp.ui.createElement("div",null,apogeeapp.ui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = apogeeapp.ui.createElement("div",null,apogeeapp.ui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    apogeeapp.ui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the apogeeapp.ui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
apogeeapp.ui.createDialog = function(options) {
    var dialog = new apogeeapp.ui.WindowFrame(options);
    return dialog;
}

apogeeapp.ui.showDialog = function(dialog) {
    var shieldElement = apogeeapp.ui.createElement("div",null,apogeeapp.ui.DIALOG_SHIELD_STYLE);
    var dialogParent = new apogeeapp.ui.WindowParent(shieldElement);
    apogeeapp.ui.dialogLayer.appendChild(shieldElement);

    dialogParent.addWindow(dialog);
}

/** This method closes a dialog created with apogeeapp.ui.createDialog. It
 *hides the window and removes the modal shiled. */
apogeeapp.ui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.close();
    apogeeapp.ui.dialogLayer.removeChild(parent.getOuterElement());
}

apogeeapp.ui.WINDOW_STATE_MINIMIZED = -1;
apogeeapp.ui.WINDOW_STATE_NORMAL = 0;
apogeeapp.ui.WINDOW_STATE_MAXIMIZED = 1;

//refers to minimized, restored or maximized
apogeeapp.ui.WINDOW_STATE_CHANGED = "window state change";

apogeeapp.ui.MINIMIZABLE = 0x01;
apogeeapp.ui.MAXIMIZABLE = 0x02;
apogeeapp.ui.CLOSEABLE = 0x04;

/** This is a handler name used to request closing the window, tab or other UI element. */
apogeeapp.ui.REQUEST_CLOSE = "request_close";
apogeeapp.ui.DENY_CLOSE = -1;

apogeeapp.ui.CLOSE_EVENT = "closed";
apogeeapp.ui.RESIZED_EVENT = "resized";
apogeeapp.ui.SHOWN_EVENT = "shown";
apogeeapp.ui.HIDDEN_EVENT = "hidden";

/** This function adds CSS data for a given member id. */
apogeeapp.ui.setMemberCssData = function(objectId,cssText) {
    var cssElementId = "css_" + objectId;
    
    var cssElement = document.getElementById(cssElementId);
    if(cssText != "") {
        if(!cssElement) {
            cssElement = document.createElement("style");
            cssElement.id = cssElementId;
            document.head.appendChild(cssElement);
        }
        cssElement.innerHTML = cssText;
    }
    else {
        if(cssElement) {
            document.head.removeChild(cssElement);
        }
    }
}

//======================================
//window content types
//These are types of content that can be put in a window or other container. If is it 
//resizable it can be fitted to the window size. If it is fixed size it can be 
//added to a scrolling window or used to set the container size
//======================================
apogeeapp.ui.RESIZABLE = 0x01;
apogeeapp.ui.FIXED_SIZE = 0x02;

//this is not an actual content type, but an option for displaying FIXED_SIZE content
apogeeapp.ui.SIZE_WINDOW_TO_CONTENT = 0x03;




