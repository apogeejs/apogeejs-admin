/** This is the main visiui file */
hax.visiui = {};


//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
hax.visiui.MENU_ZINDEX = 100;
hax.visiui.WINDOW_FRAME_ZINIDEX = 10;
hax.visiui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

hax.visiui.idIndex = 0;
hax.visiui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
hax.visiui.createId = function() {
    return hax.visiui.idBase + hax.visiui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
hax.visiui.applyStyle = function(element,style) {
    for(var key in style) {
        element.style[key] = style[key];
    }
}

//=========================================
// screate dom methods
//=========================================

/** This method applies the style json to the dom element. All arguments
 * besides type are optional.
 * 
 * type is the element type
 * properties are javascript properties, 
 * styleProperties are the style properties
 * */
hax.visiui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        hax.visiui.applyStyle(element,styleProperties);
    }
    return element;
}

//=========================================
// window and dialog methods
//=========================================

hax.visiui.dialogLayer = null;

hax.visiui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

hax.visiui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

hax.visiui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
hax.visiui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw hax.core.util.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = hax.visiui.createElement("div",null,hax.visiui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = hax.visiui.createElement("div",null,hax.visiui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    hax.visiui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the hax.visiui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
hax.visiui.createDialog = function(options) {
    var shieldElement = hax.visiui.createElement("div",null,hax.visiui.DIALOG_SHIELD_STYLE);
    var dialogParent = new hax.visiui.SimpleParentContainer(shieldElement,true);
    hax.visiui.dialogLayer.appendChild(shieldElement);
    
    if(!options.frameColorClass) options.frameColorClass = "visicomp_windowColor";
    if(!options.titleBarClass) options.titleBarClass = "visicomp_titleBarClass";
    return new hax.visiui.WindowFrame(dialogParent,options);
}

/** This method closes a dialog created with hax.visiui.createDialog. It
 *hides the window and removes the modal shiled. */
hax.visiui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.hide();
    hax.visiui.dialogLayer.removeChild(parent.getContainerElement());
}





