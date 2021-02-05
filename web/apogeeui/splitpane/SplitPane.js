import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import uiutil from "/apogeeui/uiutil.js";
import {EventManager} from "/apogeebase/apogeeBaseLib.js";

/** This is a split pane, with a right and left pane. The types of pane are 
 * given by the constants defined below:
 * SplitPane.SCROLLING_PANE
 * SplitPane.FIXED_PANE
 */ 
export default class SplitPane {

    constructor(leftPaneType,rightPaneType) {
        //mixin initialization
        this.eventManagerMixinInit();

        //-----------------
        // Create the DOM elements
        //-----------------
        
        this.container1 = uiutil.createElementWithClass("div","visiui-sp-parent");
        var container2 = uiutil.createElementWithClass("div","visiui-sp-parent2",this.container1);
        var table = uiutil.createElementWithClass("table","visiui-sp-table",container2);
        
        var row = uiutil.createElementWithClass("tr","visiui-sp-row",table);
        
        var leftCell = uiutil.createElementWithClass("td","visiui-sp-left",row);
        var divider = uiutil.createElementWithClass("td","visiui-sp-divider",row);
        var rightCell = uiutil.createElementWithClass("td","visiui-sp-right",row);

        var leftInnerPane = uiutil.createElementWithClass("div","visiui-sp-inner",leftCell);
        this.leftOuterPane = uiutil.createElementWithClass("div",leftPaneType,leftInnerPane);
        
        var rightInnerPane = uiutil.createElementWithClass("div","visiui-sp-inner",rightCell);
        this.rightOuterPane = uiutil.createElementWithClass("div",rightPaneType,rightInnerPane);

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
        var mouseMove = (e) => {
            if(resizeActive) {
                var delta = e.clientX - resizeBasePixels;
                leftCell.style.width = (resizeBasePosition + delta) + "px";
                this.dispatchEvent("move",this);
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

    /** this method returns the DOM element for ths split pane. */
    getOuterElement() {
        return this.container1;
    }

    /** this method returns the content element for the left pane. */
    getLeftPaneContainer() {
        return this.leftOuterPane;
    }

    /** this method returns the content element for the left pane. */
    getRightPaneContainer() {
        return this.rightOuterPane;
    }

}

//add mixins to this class
apogeeutil.mixin(SplitPane,EventManager);

/** This is the pane type for a pane that scrolls in both X and Y, iv needed. */
SplitPane.SCROLLING_PANE = "visiui-sp-scrolling";

/** This is the pane type for a pane that does not scrolling, hiding any overflow. */
SplitPane.FIXED_PANE = "visiui-sp-fixed";



