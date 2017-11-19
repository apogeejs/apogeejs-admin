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

apogeeapp.ui.TabFrame.CONTAINER_FRAME_MARGIN_PX = 5;

/** This method returns the dom element for the control. */
apogeeapp.ui.TabFrame.prototype.getElement = function() {
    return this.tabFrameControl;
}

/** This method returns the main dom element for the window frame. */
apogeeapp.ui.TabFrame.prototype.getTab = function(id) {
    return this.tabTable[id];
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.addTab = function(tab,makeActive) {
    var id = tab.getId();
    
    //make sure there is no tab with this name
    if(this.tabTable[id]) {
        alert("There is already a tab with this id!");
        return null;
    }
    
    tab.setTabFrame(this);
    this.tabFrame.appendChild(tab.getMainElement());
    
    var tabLabelElement = tab.getLabelElement();
    this.tabBar.appendChild(tabLabelElement);
	
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
    this.tabTable[id] = tab;
    
    if((makeActive)||(this.activeTab == null)) {
        this.setActiveTab(id);
    }
    else {
        this.updateTabDisplay();
    }
}

/** This method adds a tab to the tab frame. */
apogeeapp.ui.TabFrame.prototype.closeTab = function(id) {
    var tab = this.tabTable[id];
    if(tab) {
        this.tabFrame.removeChild(tab.getMainElement());
        
        var tabLabelElement = tab.getLabelElement();
        this.tabBar.removeChild(tabLabelElement);
        delete tabLabelElement.onclick;
        delete tabLabelElement.onmousedown;
        
        delete this.tabTable[id];
		
        if(this.activeTab == id) {
            this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,tab);
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
    var tab = this.tabTable[id];
	if(tab) {
        var oldTab;
        if(this.activeTab) {
            oldTab = this.tabTable[this.activeTab];
        }
		this.activeTab = id;
		this.tabFrame.appendChild(tab.getMainElement());
		this.updateTabDisplay();
        if(oldTab) {
            this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,oldTab);
        }
		this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,tab);
        
	}
}

/** This updates the tabs. */
apogeeapp.ui.TabFrame.prototype.updateTabDisplay = function() {
    var id;
    for(id in this.tabTable) {
        var tab = this.tabTable[id];
        if(id == this.activeTab) {
            tab.getMainElement().style.display = "";
            tab.getLabelElement().className = "visiui-tf-tab-base visiui-tf-tab-active";
        }
        else {
            tab.getMainElement().style.display = "none";
            tab.getLabelElement().className = "visiui-tf-tab-base visiui-tf-tab-inactive";
        }
    }
}
