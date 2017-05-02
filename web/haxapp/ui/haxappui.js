/** This is the main haxapp ui file */
haxapp.ui = {};

/** This should be called to initializethe resource path. */
haxapp.ui.initResourcePath = function(resourceDirectory) {
    haxapp.ui.RESOURCE_DIR = resourceDirectory;
}

/** This retreives the resoruce path for a resource. */
haxapp.ui.getResourcePath = function(relativePath) {
    return haxapp.ui.RESOURCE_DIR + relativePath;
}

//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
haxapp.ui.MENU_ZINDEX = 100;
haxapp.ui.WINDOW_FRAME_ZINIDEX = 10;
haxapp.ui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

haxapp.ui.idIndex = 0;
haxapp.ui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
haxapp.ui.createId = function() {
    return haxapp.ui.idBase + haxapp.ui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
haxapp.ui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// dom methods
//=========================================


/** This method removes all the content from a DOM element. */
haxapp.ui.removeAllChildren = function(element) {
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
haxapp.ui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        haxapp.ui.applyStyle(element,styleProperties);
    }
    return element;
}

/** This method creates a DOM element of the given type, sets the class name
 * and, if present, adds it to the given parent. */
haxapp.ui.createElementWithClass = function(elementType,className,parent) {
    var element = document.createElement(elementType);
    element.className = className;
    if(parent) parent.appendChild(element);
    return element;
}

//=========================================
// window and dialog methods
//=========================================

haxapp.ui.dialogLayer = null;

haxapp.ui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

haxapp.ui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

haxapp.ui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
haxapp.ui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw hax.base.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = haxapp.ui.createElement("div",null,haxapp.ui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = haxapp.ui.createElement("div",null,haxapp.ui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    haxapp.ui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the haxapp.ui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
haxapp.ui.createDialog = function(options) {
    var shieldElement = haxapp.ui.createElement("div",null,haxapp.ui.DIALOG_SHIELD_STYLE);
    var dialogParent = new haxapp.ui.ParentContainer(shieldElement);
    haxapp.ui.dialogLayer.appendChild(shieldElement);
    
    var dialog = new haxapp.ui.WindowFrame(options);
    dialog.setParent(dialogParent);
    return dialog;
}

/** This method closes a dialog created with haxapp.ui.createDialog. It
 *hides the window and removes the modal shiled. */
haxapp.ui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.hide();
    haxapp.ui.dialogLayer.removeChild(parent.getOuterElement());
}

haxapp.ui.WINDOW_STATE_MINIMIZED = -1;
haxapp.ui.WINDOW_STATE_NORMAL = 0;
haxapp.ui.WINDOW_STATE_MAXIMIZED = 1;

haxapp.ui.MINIMIZABLE = 0x01;
haxapp.ui.MAXIMIZABLE = 0x02;
haxapp.ui.CLOSEABLE = 0x04;





