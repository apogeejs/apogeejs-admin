/** This is a mixin is used by parents to highlight children, to display to which
 * parent a child belons.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
hax.visiui.ParentHighlighter = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this control. */
hax.visiui.ParentHighlighter.init = function(containerElement) {

this.borderOutlineStyle = "solid 3px " + hax.visiui.ParentHighlighter.getColor();
containerElement.style.border = this.borderOutlineStyle;
}

/** This method adds a windows to the parent. It does not show the window. Show must be done. */
hax.visiui.ParentHighlighter.addWindow = function(windowFrame) {
	
var windowElement = windowFrame.getElement();
windowElement.style.outline = this.borderOutlineStyle;
	
    hax.visiui.ParentContainer.addWindow.call(this,windowFrame);
}

/** This method removes the window from the parent container. */
hax.visiui.ParentHighlighter.removeWindow = function(windowFrame) {
var windowElement = windowFrame.getElement();
windowElement.style.outline = "";
	
    hax.visiui.ParentContainer.removeWindow.call(this,windowFrame);
}

//==========================
// Static method (even though it is inherited by objects)
//==========================
hax.visiui.ParentHighlighter.colorIndex = 0;
hax.visiui.ParentHighlighter.getColor = function() {
	var colorString = hax.visiui.ParentHighlighter.colorArray[hax.visiui.ParentHighlighter.colorIndex];
	hax.visiui.ParentHighlighter.colorIndex = (hax.visiui.ParentHighlighter.colorIndex + 1) % hax.visiui.ParentHighlighter.colorArray.length;
	return colorString;
}

hax.visiui.ParentHighlighter.colorArray = [
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

