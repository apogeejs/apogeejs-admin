/** This is a tab frame. The constructor takes an id for the container and
 * an options object. The tab frame wil lbe appended to the given container.
 * 
 * This is not really a general window element. It is made to fit this use case.
 * It resizes to occupy all space in the parent, starting form its existing location,
 * which in this case should be right after the menu.
 * 
 * note - document external color classes set in options
 * 
 * options: none
 * 
 * @class 
 */
haxapp.ui.TabFrame = function(parentDiv,options) {
	
    if(!options) {
        options = {};
    }
    
    //make sure these are passed in with valid colors!
    if((!options.tabBarColorClass)||(!options.activeTabColorClass)) {
        alert("The tabBarColorClass and  activeTabColorClass must be set in the options for tab frame!");
    } options.titleBarClass = "";
  
    
    //base init
    hax.EventManager.init.call(this);
    //initialize parent container after conatiner div created
	
    //variables
    this.options = options;
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = document.createElement("div");
    haxapp.ui.applyStyle(this.tabFrameControl,haxapp.ui.TabFrame.CONTAINER_STYLE);
    parentDiv.appendChild(this.tabFrameControl);
	
    this.tabFrame = document.createElement("div");
    haxapp.ui.applyStyle(this.tabFrame,haxapp.ui.TabFrame.DISPLAY_FRAME_STYLE);
	this.tabFrameControl.appendChild(this.tabFrame);  
    
    this.tabBar = document.createElement("div");
    haxapp.ui.applyStyle(this.tabBar,haxapp.ui.TabFrame.TAB_BAR_STYLE);
    this.tabBar.className = this.options.tabBarColorClass;
    this.tabFrameControl.appendChild(this.tabBar);
    
    //base init for parent continer mixin
    haxapp.ui.ParentContainer.init.call(this,this.tabFrame,this);	
}

//add components to this class
hax.base.mixin(haxapp.ui.TabFrame,hax.EventManager);
hax.base.mixin(haxapp.ui.TabFrame,haxapp.ui.ParentContainer);

//events
haxapp.ui.TabFrame.TAB_SHOWN = "tabShown";
haxapp.ui.TabFrame.TABS_RESIZED = "tabsResized";

haxapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

haxapp.ui.TabFrame.CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px",
};
haxapp.ui.TabFrame.DISPLAY_FRAME_STYLE = {
    //fixed
    "position":"relative",
    "display":"table-row",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px",
    
    //configurable
    "backgroundColor":"white",
    //"border":" 1px solid gray",
    "borderBottomWidth":" 0px"
}
haxapp.ui.TabFrame.TAB_BAR_STYLE = {
    //fixed
    "position":"relative",
    "display":"table-row",
    "width":"100%",
    
    /* set background color with an external style */
    "margin":"0px",
    "border":" 1px solid gray",
    "borderTopWidth":" 0px"
}
haxapp.ui.TabFrame.TAB_BASE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    //configurable
    "border":" 1px solid black",
    "padding":"2px"
}
haxapp.ui.TabFrame.TAB_INACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    /* set color with external class */
    "border":" 1px solid black",
    "borderTopColor":"",
    "padding":"2px"
}
haxapp.ui.TabFrame.TAB_ACTIVE_STYLE = {
    //fixed
    "display":"inline-block",
    "cursor":" default",
    
    /* set background color with an external style */
    "border":" 1px solid black",
    "borderTopColor":"white",
    "padding":"2px"
}

/** This method returns the dom element for the control. */
haxapp.ui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
haxapp.ui.TabFrame.prototype.getTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        return tabData.tabDisplay;
    }
    else {
        return null;
    }
}

/** This method adds a tab to the tab frame. */
haxapp.ui.TabFrame.prototype.addTab = function(name) {
    //make sure there is no tab with this name
    if(this.tabTable[name]) {
        alert("There is already a tab with this name!");
        return null;
    }
    
    //create the tab object
    var tab = new haxapp.ui.Tab(name, this);
    this.tabFrame.appendChild(tab.getContainerElement());
    
    //create tab label
    var tabLabelElement = document.createElement("div");
    haxapp.ui.applyStyle(tabLabelElement,haxapp.ui.TabFrame.TAB_BASE_STYLE);
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
    
//    //resize the main control element
//    this.resizeElement();
    
    return tab;
}

/** This method adds a tab to the tab frame. */
haxapp.ui.TabFrame.prototype.removeTab = function(name) {
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
haxapp.ui.TabFrame.prototype.setActiveTab = function(title) {
    this.activeTab = title;
    this.updateTabDisplay();
}

/** This mesets the active tab, by tab title. */
haxapp.ui.TabFrame.prototype.getActiveTabTitle = function() {
    return this.activeTab;
}

/** This updates the tabs. */
haxapp.ui.TabFrame.prototype.updateTabDisplay = function() {
    var title;
    for(title in this.tabTable) {
        var tabData = this.tabTable[title];
        if(title == this.activeTab) {
            tabData.tabDisplay.getContainerElement().style.display = "";
            haxapp.ui.applyStyle(tabData.tabLabel,haxapp.ui.TabFrame.TAB_ACTIVE_STYLE);
            tabData.tabLabel.className = this.options.activeTabColorClass;
            this.dispatchEvent(haxapp.ui.TabFrame.TAB_SHOWN,this.activeTab);
        }
        else {
            tabData.tabDisplay.getContainerElement().style.display = "none";
            haxapp.ui.applyStyle(tabData.tabLabel,haxapp.ui.TabFrame.TAB_INACTIVE_STYLE);
            tabData.tabLabel.className = this.options.tabBarColorClass;
        }
    }
}
