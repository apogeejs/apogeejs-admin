import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {EventManager} from "/apogeeutil/apogeeBaseLib.js";
import uiutil from "/apogeeui/uiutil.js";

/** This is a tab frame.
 * 
 * @class 
 */
export default class TabFrame {

    constructor() {
        //mixin initialization
        this.eventManagerMixinInit();
        
        //variables
        this.tabTable = {};
        this.activeTab = null;
        
        this.tabFrameControl = uiutil.createElementWithClass("div","visiui-tf-frame");
        this.tabBar = uiutil.createElementWithClass("div","visiui-tf-tab-bar",this.tabFrameControl);
        this.tabFrame = uiutil.createElementWithClass("div","visiui-tf-tab-container",this.tabFrameControl);   	
    }

    /** This method returns the dom element for the control. */
    getElement() {
        return this.tabFrameControl;
    }

    /** This method returns the main dom element for the window frame. */
    getTab(id) {
        return this.tabTable[id];
    }

    /** This method adds a tab to the tab frame. */
    addTab(tab,makeActive) {
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
        tabLabelElement.onclick = () => {
            this.setActiveTab(id);
        }
        tabLabelElement.onmousedown = (e) => {
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
    closeTab(id) {
        var tab = this.tabTable[id];
        if(tab) {
            this.tabFrame.removeChild(tab.getMainElement());
            
            var tabLabelElement = tab.getLabelElement();
            this.tabBar.removeChild(tabLabelElement);
            delete tabLabelElement.onclick;
            delete tabLabelElement.onmousedown;
            
            delete this.tabTable[id];
            
            if(this.activeTab == id) {
                this.dispatchEvent(uiutil.HIDDEN_EVENT,tab);
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

    /** This gets the active tab, by tab id. */
    getActiveTab() {
        return this.activeTab;
    }

    /** This sets the active tab, by tab id. */
    setActiveTab(id) {
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
                this.dispatchEvent(uiutil.HIDDEN_EVENT,oldTab);
            }
            this.dispatchEvent(uiutil.SHOWN_EVENT,tab);
            
        }
    }

    /** This gets the active tab, by tab id. */
    getOpenTabs() {
        var openTabs = [];
        for(var idString in this.tabTable) {
            var id = parseInt(idString);
            openTabs.push(id);
        }
        return openTabs;
    }

    /** This updates the tabs. */
    updateTabDisplay() {
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

}

//add mixins to this class
apogeeutil.mixin(TabFrame,EventManager);