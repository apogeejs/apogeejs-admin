/** This is a split pane, with a right and left pane. The types of pane are 
 * given by the constants defined below:
 * haxapp.ui.SplitPane.SCROLLING_PANE
 * haxapp.ui.SplitPane.FIXED_PANE
 */ 
haxapp.ui.SplitPane = function(leftPaneType,rightPaneType) {
    
    //-----------------
    // Create the DOM elements
    //-----------------
    
    this.container1 = haxapp.ui.createElementWithClass("div","visiui-sp-parent");
    var container2 = haxapp.ui.createElementWithClass("div","visiui-sp-parent2",this.container1);
    var table = haxapp.ui.createElementWithClass("table","visiui-sp-table",container2);
    
    var row = haxapp.ui.createElementWithClass("tr","visiui-sp-row",table);
    
    var leftCell = haxapp.ui.createElementWithClass("td","visiui-sp-left",row);
    var divider = haxapp.ui.createElementWithClass("td","visiui-sp-divider",row);
    var rightCell = haxapp.ui.createElementWithClass("td","visiui-sp-right",row);

    var leftInnerPane = haxapp.ui.createElementWithClass("div","visiui-sp-inner",leftCell);
    this.leftOuterPane = haxapp.ui.createElementWithClass("div",leftPaneType,leftInnerPane);
    
    var rightInnerPane = haxapp.ui.createElementWithClass("div","visiui-sp-inner",rightCell);
    this.rightOuterPane = haxapp.ui.createElementWithClass("div",rightPaneType,rightInnerPane);

    //-----------------
    // Create the mouse handler logic for resizing
    //-----------------
    var resizeActive = false;
    var resizeBasePixels = 0;
    var resizeBasePosition = 0;
    
    //mouse down handler
    var mouseDown = function(e) {

            resizeActive = true;
            resizeBasePixels = e.clientX;
            resizeBasePosition = leftCell.offsetWidth;

            //add resize events to the parent, since the mouse can leave this element during a move
            table.addEventListener("mouseup",mouseUp);
            table.addEventListener("mousemove",mouseMove);
            table.addEventListener("mouseleave",mouseLeave);
    }

    //mouse move handler
    var mouseMove = function(e) {
        if(resizeActive) {
            var delta = e.clientX - resizeBasePixels;
            leftCell.style.width = (resizeBasePosition + delta) + "px";
        }
    }

    //mouse up handler
    var mouseUp = function(e) {
       endResize();
    }

    //mouse leave handler
    var mouseLeave = function(e) {
        endResize();
    }
    
    //end resize function
    var endResize = function() {
        resizeActive = false;
        table.removeEventListener("mouseup",mouseUp);
        table.removeEventListener("mousemove",mouseMove);
        table.removeEventListener("mouseleave",mouseLeave);
    }
    
    divider.addEventListener("mousedown",mouseDown);

}

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
haxapp.ui.SplitPane.SCROLLING_PANE = "visiui-sp-scrolling";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
haxapp.ui.SplitPane.FIXED_PANE = "visiui-sp-fixed";

/** this method returns the DOM element for ths split pane. */
haxapp.ui.SplitPane.prototype.getOuterElement = function() {
	return this.container1;
}

/** this method returns the content element for the left pane. */
haxapp.ui.SplitPane.prototype.getLeftPaneContainer = function() {
	return this.leftOuterPane;
}

/** this method returns the content element for the left pane. */
haxapp.ui.SplitPane.prototype.getRightPaneContainer = function() {
	return this.rightOuterPane;
}



