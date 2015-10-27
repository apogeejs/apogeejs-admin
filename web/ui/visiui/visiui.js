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
