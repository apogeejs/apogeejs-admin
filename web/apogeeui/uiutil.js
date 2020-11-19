/** This is the main apogeeapp ui file */
let uiutil = {};
export {uiutil as default};

/** This should be called to initializethe resource path. */
uiutil.initResourcePath = function(resourceDirectory) {
    uiutil.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
uiutil.getResourcePath = function(relativePath) {
    return uiutil.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//======================================
// ID Generator
//======================================

uiutil.idIndex = 0;
uiutil.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
uiutil.createId = function() {
    return uiutil.idBase + uiutil.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
uiutil.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// resources
//=========================================

uiutil.MINIMIZE_CMD_IMAGE = "/minimize.png";
uiutil.RESTORE_CMD_IMAGE = "/restore.png";
uiutil.MAXIMIZE_CMD_IMAGE = "/maximize.png";
uiutil.CLOSE_CMD_IMAGE = "/close_gray.png";
uiutil.HAMBURGER_MENU_IMAGE = "/hamburger.png";
uiutil.DOT_MENU_IMAGE = "/menuDots16_darkgray.png";
uiutil.GENERIC_CELL_ICON = "/icons3/genericCellIcon.png";
uiutil.GENERIC_PAGE_ICON = "/icons3/pageIcon.png";

//=========================================
// dom methods
//=========================================


/** This method removes all the content from a DOM element. */
uiutil.removeAllChildren = function(element) {
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
uiutil.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        uiutil.applyStyle(element,styleProperties);
    }
    return element;
}

/** This method creates a DOM element of the given type, sets the class name
 * and, if present, adds it to the given parent. */
uiutil.createElementWithClass = function(elementType,className,parent) {
    var element = document.createElement(elementType);
    element.className = className;
    if(parent) parent.appendChild(element);
    return element;
}

//=========================================
// window and dialog methods
//=========================================

uiutil.dialogLayer = null;

uiutil.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

uiutil.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

uiutil.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
uiutil.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw new Error("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = uiutil.createElement("div",null,uiutil.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = uiutil.createElement("div",null,uiutil.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    uiutil.dialogLayer = elements.dialogLayer;
    
    return elements;
}


/** This is a handler name used to request closing the window, tab or other UI element. */
uiutil.REQUEST_CLOSE = "request_close";
uiutil.DENY_CLOSE = -1;

uiutil.CLOSE_EVENT = "closed";
uiutil.RESIZED_EVENT = "resized";
uiutil.SHOWN_EVENT = "shown";
uiutil.HIDDEN_EVENT = "hidden";

/** This function adds CSS data for a given member id. */
uiutil.setObjectCssData = function(objectId,cssText) {
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
uiutil.RESIZABLE = 0x01;
uiutil.FIXED_SIZE = 0x02;

uiutil.SCROLL_NONE = 0x00;
uiutil.SCROLL_VERTICAL = 0x01;
uiutil.SCROLL_HORIZONTAL = 0x02;
uiutil.SCROLL_BOTH = 0x03;


//this is not an actual content type, but an option for displaying FIXED_SIZE content
uiutil.SIZE_WINDOW_TO_CONTENT = 0x03;




