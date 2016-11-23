/** This is a mixin is used by parents to highlight children, to display to which
 * parent a child belons.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.ui.ParentHighlighter = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
haxapp.ui.ParentHighlighter.init = function(containerElement) {

this.borderOutlineStyle = "solid 3px " + haxapp.ui.ParentHighlighter.getColor();
containerElement.style.border = this.borderOutlineStyle;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
haxapp.ui.ParentHighlighter.addWindow = function(windowFrame) {
	
var windowElement = windowFrame.getElement();
windowElement.style.outline = this.borderOutlineStyle;
	
    haxapp.ui.ParentContainer.addWindow.call(this,windowFrame);
}

/** This method removes the window from the parent container. */
haxapp.ui.ParentHighlighter.removeWindow = function(windowFrame) {
var windowElement = windowFrame.getElement();
windowElement.style.outline = "";
	
    haxapp.ui.ParentContainer.removeWindow.call(this,windowFrame);
}

//==========================
// Static method (even though it is inherited by objects)
//==========================
haxapp.ui.ParentHighlighter.colorIndex = 0;
haxapp.ui.ParentHighlighter.getColor = function() {
	var colorString = haxapp.ui.ParentHighlighter.colorArray[haxapp.ui.ParentHighlighter.colorIndex];
	haxapp.ui.ParentHighlighter.colorIndex = (haxapp.ui.ParentHighlighter.colorIndex + 1) % haxapp.ui.ParentHighlighter.colorArray.length;
	return colorString;
}

haxapp.ui.ParentHighlighter.colorArray = [
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

