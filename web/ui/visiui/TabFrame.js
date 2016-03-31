/** This is a tab frame. The constructor takes an id for the container and
 * an options object. The tab frame wil lbe appended to the given container.
 * 
 * This is not really a general window element. It is made to fit this use case.
 * It resizes to occupy all space in the parent, starting form its existing location,
 * which in this case should be right after the menu.
 * 
 * options: none
 * 
 * @class 
 */
visicomp.visiui.TabFrame = function(options) {
	
    if(!options) {
        options = {};
    }
    
    //base init
    visicomp.core.EventManager.init.call(this);
    //initialize parent container after conatiner div created
	
    //variables
    this.options = options;
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabFrameControl,visicomp.visiui.TabFrame.CONTAINER_FRAME_STYLE);
	
    this.tabFrame = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabFrame,visicomp.visiui.TabFrame.DISPLAY_FRAME_STYLE);
	this.tabFrameControl.appendChild(this.tabFrame);  
    
    this.tabBar = document.createElement("div");
    visicomp.visiui.applyStyle(this.tabBar,visicomp.visiui.TabFrame.TAB_BAR_STYLE);
    this.tabFrameControl.appendChild(this.tabBar);
    
    //base init for parent continer mixin
    visicomp.visiui.ParentContainer.init.call(this,this.tabFrame,this);	

	//prevent default drag action
	var moveHandler = function(e) {e.preventDefault();};
    this.tabFrameControl.addEventListener("mousemove",moveHandler);
    
    //handler to resize on window resize
    var instance = this;
    window.addEventListener(visicomp.visiui.WindowFrame.RESIZED, function() {
        instance.resizeElement();
    });
    
    //calculate the size
    this.resizeElement();
}

//add components to this class
visicomp.core.util.mixin(visicomp.visiui.TabFrame,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.visiui.TabFrame,visicomp.visiui.ParentContainer);

//events
visicomp.visiui.TabFrame.TAB_SHOWN = "tabShown";
visicomp.visiui.TabFrame.TABS_RESIZED = "tabsResized";

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
    //"border":" 1px solid gray",
    "border-bottom-width":" 0px"
}
visicomp.visiui.TabFrame.TAB_BAR_STYLE = {
    //fixed
    
    //configurable
    "background-color":visicomp.visiui.colors.tabFrameColor,
    "margin":"0px",
    "border":" 1px solid gray",
    "border-top-width":" 0px"
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
    "background-color":visicomp.visiui.colors.tabFrameColor,
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
visicomp.visiui.TabFrame.prototype.getTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        return tabData.tabDisplay;
    }
    else {
        return null;
    }
}

/** This method adds a tab to the tab frame. */
visicomp.visiui.TabFrame.prototype.addTab = function(name) {
    //make sure there is no tab with this name
    if(this.tabTable[name]) {
        alert("There is already a tab with this name!");
        return null;
    }
    
    //create the tab object
    var tab = new visicomp.visiui.Tab(name, this);
    this.tabFrame.appendChild(tab.getContainerElement());
    
    //create tab label
    var tabLabelElement = document.createElement("div");
    visicomp.visiui.applyStyle(tabLabelElement,visicomp.visiui.TabFrame.TAB_BASE_STYLE);
    tabLabelElement.innerHTML = name;
    this.tabBar.appendChild(tabLabelElement);
	
    //add the click handler
    var instance = this;
    tabLabelElement.onclick = function() {
        instance.setActiveTab(name);
    }
    tabLabelElement.onmousedown = function(e) {
        //this prevents text selection
        e.preventDefault();
    }
	
    //add to tabs
    var tabData = {};
    tabData.tabDisplay = tab;
    tabData.tabLabel = tabLabelElement;
    
    this.tabTable[name] = tabData;
    if(this.activeTab == null) {
        this.activeTab = name;
    }
    this.updateTabDisplay();
    
    //resize the main control element
    this.resizeElement();
    
    return tab;
}

/** This method adds a tab to the tab frame. */
visicomp.visiui.TabFrame.prototype.removeTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        this.tabFrame.removeChild(tabData.tabDisplay.getContainerElement());
        this.tabBar.removeChild(tabData.tabLabel);
        delete this.tabTable[name];
		
        if(this.activeTab == name) {
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
    for(title in this.tabTable) {
        var tabData = this.tabTable[title];
        if(title == this.activeTab) {
            tabData.tabDisplay.getContainerElement().style.display = "";
            visicomp.visiui.applyStyle(tabData.tabLabel,visicomp.visiui.TabFrame.TAB_ACTIVE_STYLE);
            this.dispatchEvent(visicomp.visiui.TabFrame.TAB_SHOWN,this.activeTab);
        }
        else {
            tabData.tabDisplay.getContainerElement().style.display = "none";
            visicomp.visiui.applyStyle(tabData.tabLabel,visicomp.visiui.TabFrame.TAB_INACTIVE_STYLE);
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
        
    this.dispatchEvent(visicomp.visiui.TabFrame.TABS_RESIZED,this);
}