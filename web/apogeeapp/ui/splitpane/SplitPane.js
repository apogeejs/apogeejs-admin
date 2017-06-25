/** This is a split pane, with a right and left pane. The types of pane are 
 * given by the constants defined below:
 * apogeeapp.ui.SplitPane.SCROLLING_PANE
 * apogeeapp.ui.SplitPane.FIXED_PANE
 */ 
apogeeapp.ui.SplitPane = function(leftPaneType,rightPaneType) {
    
    //-----------------
    // Create the DOM elements
    //-----------------
    
    this.container1 = apogeeapp.ui.createElementWithClass("div","visiui-sp-parent");
    var container2 = apogeeapp.ui.createElementWithClass("div","visiui-sp-parent2",this.container1);
    var table = apogeeapp.ui.createElementWithClass("table","visiui-sp-table",container2);
    
    var row = apogeeapp.ui.createElementWithClass("tr","visiui-sp-row",table);
    
    var leftCell = apogeeapp.ui.createElementWithClass("td","visiui-sp-left",row);
    var divider = apogeeapp.ui.createElementWithClass("td","visiui-sp-divider",row);
    var rightCell = apogeeapp.ui.createElementWithClass("td","visiui-sp-right",row);

    var leftInnerPane = apogeeapp.ui.createElementWithClass("div","visiui-sp-inner",leftCell);
    this.leftOuterPane = apogeeapp.ui.createElementWithClass("div",leftPaneType,leftInnerPane);
    
    var rightInnerPane = apogeeapp.ui.createElementWithClass("div","visiui-sp-inner",rightCell);
    this.rightOuterPane = apogeeapp.ui.createElementWithClass("div",rightPaneType,rightInnerPane);

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
apogeeapp.ui.SplitPane.SCROLLING_PANE = "visiui-sp-scrolling";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
apogeeapp.ui.SplitPane.FIXED_PANE = "visiui-sp-fixed";

/** this method returns the DOM element for ths split pane. */
apogeeapp.ui.SplitPane.prototype.getOuterElement = function() {
	return this.container1;
}

/** this method returns the content element for the left pane. */
apogeeapp.ui.SplitPane.prototype.getLeftPaneContainer = function() {
	return this.leftOuterPane;
}

/** this method returns the content element for the left pane. */
apogeeapp.ui.SplitPane.prototype.getRightPaneContainer = function() {
	return this.rightOuterPane;
}



