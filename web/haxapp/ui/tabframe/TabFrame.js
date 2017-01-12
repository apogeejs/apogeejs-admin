/** This is a tab frame.
 * 
 * @class 
 */
haxapp.ui.TabFrame = function() {
    
    //base init
    hax.EventManager.init.call(this);
    //initialize parent container after conatiner div created
	
    //variables
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = haxapp.ui.createElementWithClass("div","visiui-tf-frame");
    this.tabBar = haxapp.ui.createElementWithClass("div","visiui-tf-tab-bar",this.tabFrameControl);
    this.tabFrame = haxapp.ui.createElementWithClass("div","visiui-tf-tab-container",this.tabFrameControl);   
    
    
    //base init for parent continer mixin
    haxapp.ui.ParentContainer.init.call(this,this.tabFrame,this);	
}

//add components to this class
hax.base.mixin(haxapp.ui.TabFrame,hax.EventManager);
hax.base.mixin(haxapp.ui.TabFrame,haxapp.ui.ParentContainer);

//events
haxapp.ui.TabFrame.TAB_SHOWN = "tabShown";

haxapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

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
    this.tabFrame.appendChild(tab.getOuterElement());
    
    //create tab label
    var tabLabelElement = haxapp.ui.createElementWithClass("div","visiui-tf-tab-base visiui-tf-tab-inactive",this.tabBar);
    tabLabelElement.innerHTML = name;
	
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
            tabData.tabDisplay.getOuterElement().style.display = "";
            tabData.tabLabel.className = "visiui-tf-tab-base visiui-tf-tab-active";
        }
        else {
            tabData.tabDisplay.getOuterElement().style.display = "none";
            tabData.tabLabel.className = "visiui-tf-tab-base visiui-tf-tab-inactive";
        }
    }
}
