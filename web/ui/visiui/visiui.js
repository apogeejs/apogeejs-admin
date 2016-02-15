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

visicomp.visiui.dialogParent = null;

visicomp.visiui.BASE_ELEMENT_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "z-index":1
}

visicomp.visiui.DIALOG_LAYER_STYLE = {
    "position":"absolute",
    "left":"0px",
    "right":"0px",
    "top":"0px",
    "bottom":"0px",
    "z-index": 2,
    "pointer-events": "none"
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
    
//I should implement the events on here!
    visicomp.visiui.dialogParent = new visicomp.visiui.SimpleParentContainer(elements.dialogLayer,true);
    
    return elements;
}

/** This returns the parent container for dialogs. */
visicomp.visiui.getDialogParent = function() {
    return visicomp.visiui.dialogParent;
}
