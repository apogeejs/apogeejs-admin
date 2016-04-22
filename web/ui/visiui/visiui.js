/** This is the main visiui file */
visicomp.visiui = {};


//I put some utilities in here. I shoudl figure out a better place to put this.

//=====================================
// ZIndex Constants
//=====================================
visicomp.visiui.MENU_ZINDEX = 100;
visicomp.visiui.WINDOW_FRAME_ZINIDEX = 10;
visicomp.visiui.DIALOG_ZINDEX = 200;

//======================================
// ID Generator
//======================================

visicomp.visiui.idIndex = 0;
visicomp.visiui.idBase = "_visiui_id_";

/** This method generates a generic id for dom elements. */
visicomp.visiui.createId = function() {
    return visicomp.visiui.idBase + visicomp.visiui.idIndex++;
}

//=========================================
// style methods
//=========================================

/** This method applies the style json to the dom element. */
visicomp.visiui.applyStyle = function(element,style) {
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
visicomp.visiui.createElement = function(type,properties,styleProperties) {
    var element = document.createElement(type);
    if(properties) {
        for(var key in properties) {
            element[key] = properties[key];
        }
    }
    if(styleProperties) {
        visicomp.visiui.applyStyle(element,styleProperties);
    }
    return element;
}

//=========================================
// window and dialog methods
//=========================================

visicomp.visiui.dialogLayer = null;

visicomp.visiui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex":1
}

visicomp.visiui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "zIndex": 2,
    "pointerEvents": "none"
}

visicomp.visiui.DIALOG_SHIELD_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "pointerEvents": "auto"
}
    
visicomp.visiui.initWindows = function(appElementId) {
    //create the ui elements from the app element
    var appContainer = document.getElementById(appElementId);
    if(!appContainer) {
        throw visicomp.core.util.createError("Container ID not found: " + appElementId);
    }
    
    var elements = {};
    elements.baseElement = visicomp.visiui.createElement("div",null,visicomp.visiui.BASE_ELEMENT_STYLE); 
    elements.dialogLayer = visicomp.visiui.createElement("div",null,visicomp.visiui.DIALOG_LAYER_STYLE);
    
    appContainer.appendChild(elements.baseElement);
    appContainer.appendChild(elements.dialogLayer);
    
    visicomp.visiui.dialogLayer = elements.dialogLayer;
    
    return elements;
}

/** This method creates a normal window which is situated above a shiled layer blocking
 *out events to the app, making the dialog like a modal dialog. If this function is used
 *to create a dialog, it must be closed with the visicomp.visiui.closeDialog function to
 *remove the modal layer, whether or not the dialog was shown. The options passed are the 
 *normal options for a window frame. (Note - if there are other events with whihc to act with
 *the app they may need to be shileded too.) */
visicomp.visiui.createDialog = function(options) {
    var shieldElement = visicomp.visiui.createElement("div",null,visicomp.visiui.DIALOG_SHIELD_STYLE);
    var dialogParent = new visicomp.visiui.SimpleParentContainer(shieldElement,true);
    visicomp.visiui.dialogLayer.appendChild(shieldElement);
    return new visicomp.visiui.WindowFrame(dialogParent,options);
}

/** This method closes a dialog created with visicomp.visiui.createDialog. It
 *hides the window and removes the modal shiled. */
visicomp.visiui.closeDialog = function(dialog) {
    var parent = dialog.getParent();
    dialog.hide();
    visicomp.visiui.dialogLayer.removeChild(parent.getContainerElement());
}





