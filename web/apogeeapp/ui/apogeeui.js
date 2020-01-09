import base from "/apogeeutil/base.js";

/** This is the main apogeeapp ui file */
let apogeeui = {};
export {apogeeui as default};

/** This should be called to initializethe resource path. */
apogeeui.initResourcePath = function(resourceDirectory) {
    apogeeui.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
apogeeui.getResourcePath = function(relativePath) {
    return apogeeui.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
apogeeui.MENU_ZINDEX = 100;
apogeeui.WINDOW_FRAME_ZINIDEX = 10;
apogeeui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

apogeeui.idIndex = 0;
apogeeui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
apogeeui.createId = function() {
    return apogeeui.idBase + apogeeui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
apogeeui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// resources
//=========================================

apogeeui.MINIMIZE_CMD_IMAGE = "/minimize.png";
apogeeui.RESTORE_CMD_IMAGE = "/restore.png";
apogeeui.MAXIMIZE_CMD_IMAGE = "/maximize.png";
apogeeui.CLOSE_CMD_IMAGE = "/close_gray.png";
apogeeui.MENU_IMAGE = "/hamburger.png";

//=========================================
// dom methods
//=========================================


/** This method removes all the content from a DOM element. */
apogeeui.removeAllChildren = function(element) {
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
apogeeui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        apogeeui.applyStyle(element,styleProperties);
    }
    return element;
}

/** This method creates a DOM element of the given type, sets the class name
 * and, if present, adds it to the given parent. */
apogeeui.createElementWithClass = function(elementType,className,parent) {
    var element = document.createElement(elementType);
    element.className = className;
    if(parent) parent.appendChild(element);
    return element;
}

//=========================================
// window and dialog methods
//=========================================

apogeeui.dialogLayer = null;

apogeeui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

apogeeui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

apogeeui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
apogeeui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw base.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = apogeeui.createElement("div",null,apogeeui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = apogeeui.createElement("div",null,apogeeui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    apogeeui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

apogeeui.WINDOW_STATE_MINIMIZED = -1;
apogeeui.WINDOW_STATE_NORMAL = 0;
apogeeui.WINDOW_STATE_MAXIMIZED = 1;

//refers to minimized, restored or maximized
apogeeui.WINDOW_STATE_CHANGED = "window state change";

apogeeui.MINIMIZABLE = 0x01;
apogeeui.MAXIMIZABLE = 0x02;
apogeeui.CLOSEABLE = 0x04;

/** This is a handler name used to request closing the window, tab or other UI element. */
apogeeui.REQUEST_CLOSE = "request_close";
apogeeui.DENY_CLOSE = -1;

apogeeui.CLOSE_EVENT = "closed";
apogeeui.RESIZED_EVENT = "resized";
apogeeui.SHOWN_EVENT = "shown";
apogeeui.HIDDEN_EVENT = "hidden";

/** This function adds CSS data for a given member id. */
apogeeui.setMemberCssData = function(objectId,cssText) {
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
apogeeui.RESIZABLE = 0x01;
apogeeui.FIXED_SIZE = 0x02;

apogeeui.SCROLL_NONE = 0x00;
apogeeui.SCROLL_VERTICAL = 0x01;
apogeeui.SCROLL_HORIZONTAL = 0x02;
apogeeui.SCROLL_BOTH = 0x03;


//this is not an actual content type, but an option for displaying FIXED_SIZE content
apogeeui.SIZE_WINDOW_TO_CONTENT = 0x03;




