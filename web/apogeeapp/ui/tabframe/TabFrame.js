/** This is a tab frame.
 * 
 * @class 
 */
apogeeapp.ui.TabFrame = function() {
    
    //base init
    apogee.EventManager.init.call(this);
	
    //variables
    this.tabTable = {};
    this.activeTab = null;
    
    this.tabFrameControl = apogeeapp.ui.createElementWithClass("div","visiui-tf-frame");
    this.tabBar = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-bar",this.tabFrameControl);
    this.tabFrame = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-container",this.tabFrameControl);   	
}

//add components to this class
apogee.base.mixin(apogeeapp.ui.TabFrame,apogee.EventManager);

//events
apogeeapp.ui.TabFrame.TAB_ADDED = "tabAdded";
apogeeapp.ui.TabFrame.TAB_SHOWN = "tabShown";
apogeeapp.ui.TabFrame.TAB_HIDDEN = "tabHidden";

apogeeapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

/** This method returns the dom element for the control. */
apogeeapp.ui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
apogeeapp.ui.TabFrame.prototype.getTab = function(name) {
    var tabData = this.tabTable[name];
    if(tabData) {
        return tabData.tabDisplay;
    }
    else {
        return null;
    }
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.addTab = function(id) {
    //make sure there is no tab with this name
    if(this.tabTable[id]) {
        alert("There is already a tab with this name!");
        return null;
    }
    
    //create tab label - initialize with the id (should be renamed)
    var tabLabelElement = apogeeapp.ui.createElementWithClass("div","visiui-tf-tab-base visiui-tf-tab-inactive",this.tabBar);
    
    //create the tab object
    var tab = new apogeeapp.ui.Tab(id, tabLabelElement, this);
    this.tabFrame.appendChild(tab.getOuterElement());
	
    //add the click handler
    var instance = this;
    tabLabelElement.onclick = function() {
        instance.setActiveTab(id);
    }
    tabLabelElement.onmousedown = function(e) {
        //this prevents text selection
        e.preventDefault();
    }
	
    //add to tabs
    var tabData = {};
    tabData.tabDisplay = tab;
    tabData.tabLabel = tabLabelElement;
    
    this.tabTable[id] = tabData;
    if(this.activeTab == null) {
        this.activeTab = id;
    }
    
    this.dispatchEvent(apogeeapp.ui.TabFrame.TAB_ADDED,tab);
    this.updateTabDisplay();
    return tab;
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.closeTab = function(id) {
    var tabData = this.tabTable[id];
    if(tabData) {
        this.tabFrame.removeChild(tabData.tabDisplay.getOuterElement());
        this.tabBar.removeChild(tabData.tabLabel);
        delete this.tabTable[id];
		
        if(this.activeTab == id) {
            this.dispatchEvent(apogeeapp.ui.TabFrame.TAB_HIDDEN,id);
            this.activeTab = null;
            //choose a random tab
            for(var newId in this.tabTable) {
                this.setActiveTab(newId);
                break;
            }
        }
        this.updateTabDisplay();
    }
}

/** This mesets the active tab, by tab title. */
apogeeapp.ui.TabFrame.prototype.setActiveTab = function(id) {
    var tabEntry = this.tabTable[id];
	if(tabEntry) {
		this.activeTab = id;
		this.tabFrame.appendChild(tabEntry.tabDisplay.getOuterElement());
		this.updateTabDisplay();
		this.dispatchEvent(apogeeapp.ui.TabFrame.TAB_SHOWN,id);
	}
}

/** This mesets the active tab, by tab title. */
apogeeapp.ui.TabFrame.prototype.getActiveTabTitle = function() {
    return this.activeTab;
}

/** This updates the tabs. */
apogeeapp.ui.TabFrame.prototype.updateTabDisplay = function() {
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
