/** This is a mixin that encapsulates the base functionality of a parent container for a control
 * The parent container must provide events for when is is shown, hidden and resized.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.visiui.ParentHighlighter = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
visicomp.visiui.ParentHighlighter.init = function(containerElement) {

this.borderOutlineStyle = "solid 3px " + visicomp.visiui.ParentHighlighter.getColor();
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
    "DimGray",
    "Indigo",
    "DarkCyan",
    "LimeGreen",
    "RebeccaPurple",
    "MediumBlue",
    "DarkGoldenRod",
    "Navy",
    "MediumSeaGreen",
    "DarkViolet",
    "ForestGreen",
    "RoyalBlue",
    "Chocolate",
    "Red",
    "Purple",
    "DarkSlateGray",
    "OliveDrab",
    "DarkRed",
    "MidnightBlue",
    "Brown",
    "DarkMagenta",
    "DarkSlateBlue",
    "Green",
    "Sienna",
    "FireBrick",
    "Blue",
    "Olive",
    "SteelBlue",
    "Teal",
    "IndianRed",
    "MediumVioletRed",
    "SlateGray",
    "SaddleBrown",
    "SeaGreen",
    "Chartreuse",
    "LightSeaGreen",
    "DarkBlue",
    "Crimson",
    "Lime",
    "LawnGreen",
    "DarkOliveGreen",
    "OrangeRed",
    "Maroon",
    "DarkOrange",
    "Gray",
    "SpringGreen"
];

