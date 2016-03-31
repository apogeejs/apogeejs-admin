/** This is a mixin that encapsulates the base functionality of a parent container for a control
 * The parent container must provide events for when is is shown, hidden and resized.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.visiui.ParentHighlighter = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.visiui.ParentHighlighter.init = function(containerElement) {

this.borderOutlineStyle = "solid 2px " + visicomp.visiui.ParentHighlighter.getColor();
containerElement.style.border = this.borderOutlineStyle;

}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
visicomp.visiui.ParentHighlighter.addWindow = function(windowFrame) {
	
var windowElement = windowFrame.getElement();
windowElement.style.outline = this.borderOutlineStyle;
	
    visicomp.visiui.ParentContainer.addWindow.call(this,windowFrame);
}

/** This method removes the window from the parent container. */
visicomp.visiui.ParentHighlighter.removeWindow = function(windowFrame) {
var windowElement = windowFrame.getElement();
windowElement.style.outline = "";
	
    visicomp.visiui.ParentContainer.removeWindow.call(this,windowFrame);
}

//==========================
// Static method (even though it is inherited by objects)
//==========================
visicomp.visiui.ParentHighlighter.colorIndex = 0;
visicomp.visiui.ParentHighlighter.getColor = function() {
	var colorString = visicomp.visiui.ParentHighlighter.colorArray[visicomp.visiui.ParentHighlighter.colorIndex];
	visicomp.visiui.ParentHighlighter.colorIndex = (visicomp.visiui.ParentHighlighter.colorIndex + 1) % visicomp.visiui.ParentHighlighter.colorArray.length;
	return colorString;
}

visicomp.visiui.ParentHighlighter.colorArray = [
'AliceBlue'	,
'AntiqueWhite'	,
'Aqua',
'Aquamarine'	,
'Azure'	,
'Beige'	,
'Bisque'	,
'Black'	,
'BlanchedAlmond '	,
'Blue '	,
'BlueViolet '	,
'Brown '	,
'BurlyWood '	,
'CadetBlue '	,
'Chartreuse '	,
'Chocolate '	,
'Coral '	,
'CornflowerBlue '	,
'Cornsilk '	,
'Crimson '	,
'Cyan '	,
'DarkBlue '	,
'DarkCyan '	,
'DarkGoldenRod '	,
'DarkGray '	,
'DarkGrey '	,
'DarkGreen '	,
'DarkKhaki '	,
'DarkMagenta '	,
'DarkOliveGreen '	,
'DarkOrange '	,
'DarkOrchid '	,
'DarkRed '	,
'DarkSalmon '	,
'DarkSeaGreen '	,
'DarkSlateBlue '	,
'DarkSlateGray '	,
'DarkSlateGrey '	,
'DarkTurquoise '	,
'DarkViolet '	,
'DeepPink '	,
'DeepSkyBlue '	,
'DimGray '	,
'DimGrey '	,
'DodgerBlue '	,
'FireBrick '	,
'FloralWhite '	,
'ForestGreen '	,
'Fuchsia '	,
'Gainsboro '	,
'GhostWhite '	,
'Gold '	,
'GoldenRod '	,
'Gray '	,
'Grey '	,
'Green '	,
'GreenYellow '	,
'HoneyDew '	,
'HotPink '	,
'IndianRed  '	,
'Indigo  '	,
'Ivory '	,
'Khaki '	,
'Lavender '	,
'LavenderBlush '	,
'LawnGreen '	,
'LemonChiffon '	,
'LightBlue '	,
'LightCoral '	,
'LightCyan '	,
'LightGoldenRodYellow '	,
'LightGray '	,
'LightGrey '	,
'LightGreen '	,
'LightPink '	,
'LightSalmon '	,
'LightSeaGreen '	,
'LightSkyBlue '	,
'LightSlateGray '	,
'LightSlateGrey '	,
'LightSteelBlue '	,
'LightYellow '	,
'Lime '	,
'LimeGreen '	,
'Linen '	,
'Magenta '	,
'Maroon '	,
'MediumAquaMarine '	,
'MediumBlue '	,
'MediumOrchid '	,
'MediumPurple '	,
'MediumSeaGreen '	,
'MediumSlateBlue '	,
'MediumSpringGreen '	,
'MediumTurquoise '	,
'MediumVioletRed '	,
'MidnightBlue '	,
'MintCream '	,
'MistyRose '	,
'Moccasin '	,
'NavajoWhite '	,
'Navy '	,
'OldLace '	,
'Olive '	,
'OliveDrab '	,
'Orange '	,
'OrangeRed '	,
'Orchid '	,
'PaleGoldenRod '	,
'PaleGreen '	,
'PaleTurquoise '	,
'PaleVioletRed '	,
'PapayaWhip '	,
'PeachPuff '	,
'Peru '	,
'Pink '	,
'Plum '	,
'PowderBlue '	,
'Purple '	,
'RebeccaPurple '	,
'Red '	,
'RosyBrown '	,
'RoyalBlue '	,
'SaddleBrown '	,
'Salmon '	,
'SandyBrown '	,
'SeaGreen '	,
'SeaShell '	,
'Sienna '	,
'Silver '	,
'SkyBlue '	,
'SlateBlue '	,
'SlateGray '	,
'SlateGrey '	,
'Snow '	,
'SpringGreen '	,
'SteelBlue '	,
'Tan '	,
'Teal '	,
'Thistle '	,
'Tomato '	,
'Turquoise '	,
'Violet '	,
'Wheat '	,
'White '	,
'WhiteSmoke '	,
'Yellow '	,
'YellowGreen '
]
