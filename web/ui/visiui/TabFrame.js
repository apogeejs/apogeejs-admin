/** This is a tab frame. The constructor takes an id for the container and
 * an options object. The tab frame wil lbe appended to the given container.
 * 
 * options: none
 * 
 * @class 
 */
visicomp.visiui.TabFrame = function(options) {
	
    if(!options) {
        options = {};
    }
	
    //variables
    this.options = options;
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabFrameControl,visicomp.visiui.TabFrame.CONTAINER_FRAME_STYLE);
	
    this.tabFrame = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabFrame,visicomp.visiui.TabFrame.DISPLAY_FRAME_STYLE);
	this.tabFrameControl.appendChild(this.tabFrame);
  
////CONTEXT MENU EXAMPLE  
//var instance = this;    
//this.tabFrame.oncontextmenu = function(event) {
//    var contextMenu = new visicomp.visiui.MenuBody();
//    contextMenu.addCallbackMenuItem("First",function() {alert("first");});
//    contextMenu.addCallbackMenuItem("Second",function() {alert("second");});
//    contextMenu.addCallbackMenuItem("Third",function() {alert("third");});
//    contextMenu.addCallbackMenuItem("Fourth",function() {alert("fourth");});
//    visicomp.visiui.Menu.showContextMenu(contextMenu,event);
//}    
    
    
    this.tabBar = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabBar,visicomp.visiui.TabFrame.TAB_BAR_STYLE);
    this.tabFrameControl.appendChild(this.tabBar);
	
	//prevent default drag action
	var moveHandler = function(e) {e.preventDefault();};
    this.tabFrameControl.addEventListener("mousemove",moveHandler);
    
    //handler to resize on window resize
    var instance = this;
    window.addEventListener("resize", function() {
        instance.resizeElement();
    });
    
    //calculate the size
    this.resizeElement();
}

visicomp.visiui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

visicomp.visiui.TabFrame.CONTAINER_FRAME_STYLE = {
    "position":"absolute",
    "margin":visicomp.visiui.TabFrame.CONTAINER_FRAME_MARGIN_PX + "px",
    "padding":"0px"
}
visicomp.visiui.TabFrame.DISPLAY_FRAME_STYLE = {
    //fixed
    "position":"relative",
    "overflow":"auto",
    
    //configurable
    "background-color":"white",
    "border":" 1px solid gray",
    "border-bottom-width":" 0px"
}
visicomp.visiui.TabFrame.TAB_BAR_STYLE = {
    //fixed
    
    //configurable
    "background-color":"rgb(122,165,226)",
    "margin":"0px",
    "border":" 1px solid gray",
    "border-top-width":" 0px"
}
visicomp.visiui.TabFrame.TAB_WINDOW_STYLE = {
    "top":"0px",
    "bottom":"0px",
    "left":"0px",
    "right":"0px",
    "position":"absolute",
    "background-color":"white"
}
visicomp.visiui.TabFrame.TAB_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    //configurable
    "border":" 1px solid black",
    "padding":"2px"
}
visicomp.visiui.TabFrame.TAB_INACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    //configurable
    "background-color":"rgb(122,165,226)",
    "border":" 1px solid black",
    "border-top-color":"",
    "padding":"2px"
}
visicomp.visiui.TabFrame.TAB_ACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    //configurable
    "background-color":"white",
    "border":" 1px solid black",
    "border-top-color":"white",
    "padding":"2px"
}

/** This method returns the dom element for the control. */
visicomp.visiui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
visicomp.visiui.TabFrame.prototype.getTabElement = function(title) {
    var tabData = this.tabTable[title];
    if(tabData) {
        return tabData.displayFrame;
    }
    else {
        return null;
    }
}

/** This method adds a tab to the tab frame. */
visicomp.visiui.TabFrame.prototype.addTab = function(title) {
    //make sure there is no tab with this name
    if(this.tabTable[title]) {
        alert("There is already a tab with this name!");
        return null;
    }
    
    //create the tab element
    var element = document.createElement("div");
    visicomp.visiui.applyStyle(element,visicomp.visiui.TabFrame.TAB_WINDOW_STYLE);
	
    var tabData = {};
    tabData.title = title;
    tabData.displayFrame = element;
	
    //add the element
    this.tabFrame.appendChild(element);

    //create tab
    var tabElement = document.createElement("div");
    visicomp.visiui.applyStyle(tabElement,visicomp.visiui.TabFrame.TAB_BASE_STYLE);
    tabElement.innerHTML = title;
    this.tabBar.appendChild(tabElement);
    tabData.tabElement = tabElement;
	
    //add the click handler
    var instance = this;
    tabElement.onclick = function() {
        instance.setActiveTab(title);
    }
    tabElement.onmousedown = function(e) {
        //this prevents text selection
        e.preventDefault();
    }
	
    //check if this tab is active
    this.tabTable[title] = tabData;
    if(this.activeTab == null) {
        this.activeTab = title;
    }
    this.updateTabDisplay();
    
    //resize the main control element
    this.resizeElement();
    
    return element;
}

/** This method adds a tab to the tab frame. */
visicomp.visiui.TabFrame.prototype.removeTab = function(title) {
    var tabData = this.tabTable[title];
    if(tabData) {
        this.tabFrame.removeChild(tabData.displayFrame);
        this.tabBar.removeChild(tabData.tabElement);
        delete this.tabTable[title];
		
        if(this.activeTab == title) {
            this.activeTab = null;
            //choose a random tab
            for(var title in this.tabTable) {
                this.activeTab = title;
                break;
            }
        }
        this.updateTabDisplay();
    }
}

/** This mesets the active tab, by tab title. */
visicomp.visiui.TabFrame.prototype.setActiveTab = function(title) {
    this.activeTab = title;
    this.updateTabDisplay();
}

/** This mesets the active tab, by tab title. */
visicomp.visiui.TabFrame.prototype.getActiveTabTitle = function() {
    return this.activeTab;
}

/** This updates the tabs. */
visicomp.visiui.TabFrame.prototype.updateTabDisplay = function() {
    var title;
    var tabInfo;
    for(title in this.tabTable) {
        tabInfo = this.tabTable[title];
        if(title == this.activeTab) {
            tabInfo.displayFrame.style.display = "";
            visicomp.visiui.applyStyle(tabInfo.tabElement,visicomp.visiui.TabFrame.TAB_ACTIVE_STYLE);
        }
        else {
            tabInfo.displayFrame.style.display = "none";
            visicomp.visiui.applyStyle(tabInfo.tabElement,visicomp.visiui.TabFrame.TAB_INACTIVE_STYLE);
        }
    }
}

/** This method resizes the cotnrol. Resize is done automatically when the control
 * tabs are added or when the window resizes. On other events that cause the available
 * area for this control to change this function should be called. */
visicomp.visiui.TabFrame.prototype.resizeElement = function() {
    //set the width
    var parent = this.tabFrameControl.offsetParent;
    if(!parent) return;
    var controlWidth = parent.clientWidth - this.tabFrameControl.offsetLeft;
    this.tabFrame.style.width = (controlWidth - 2 * visicomp.visiui.TabFrame.CONTAINER_FRAME_MARGIN_PX) + "px";
    this.tabBar.style.width = (controlWidth - 2 * visicomp.visiui.TabFrame.CONTAINER_FRAME_MARGIN_PX) + "px";
    
    //set the height
    var controlHeight = parent.clientHeight - this.tabFrameControl.offsetTop;
    this.tabFrame.style.height = (controlHeight - this.tabBar.offsetHeight - 
            2 * visicomp.visiui.TabFrame.CONTAINER_FRAME_MARGIN_PX) + "px";
}