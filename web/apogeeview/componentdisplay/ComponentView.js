import apogeeutil from "/apogeeutil/apogeeUtilLib.js";


import apogeeui from "/apogeeui/apogeeui.js";
import {updateComponent} from "/apogeeview/commandseq/updatecomponentseq.js";
import {deleteComponent} from "/apogeeview/commandseq/deletecomponentseq.js";
import TreeComponentDisplay from "/apogeeview/componentdisplay/TreeComponentDisplay.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 

/** This is the base functionality for a component. */
export default class ComponentView {

    constructor(modelView,component) {
        
        this.modelView = modelView;
        this.uiActiveParent = null;
        this.component = component;
        
        //ui elements
        this.childComponentDisplay = null; //this is the main display, inside the parent tab
        this.childDisplayState = null;
        
        this.tabDisplay = null; //only valid on parents, which open into a tab
        
        this.treeDisplay = this.createTreeDisplay(); //this is shown in the tree view
        this.treeState = null;

        this.loadStateFromComponent();

        this.component.addListener("updated",eventInfo => this.componentUpdated(eventInfo));
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This method returns the base member for this component. */
    getComponent() {
        return this.component;
    }

    getName() {
        return this.component.getName();
    }

    getFullName() {
        return this.component.getFullName();
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath) {
        return this.component.getDisplayName(useFullPath);
    }

    getParentComponentView() {
        let parentComponent = this.component.getParentComponent();
        if(parentComponent) {
            let parentMemberId = parentComponent.getId();
            return this.modelView.getComponentView(parentMemberId);
        }
        else {
            return null;
        }

    }

//--- VIEW ITEM ---//
    /** This method returns the icon url for the component. */
    getIconUrl() {
        if(this.constructor.ICON_URL) {
            return this.constructor.ICON_URL;
        }
        else {
            var resPath = this.constructor.ICON_RES_PATH;
            if(!resPath) resPath = ComponentView.DEFAULT_ICON_RES_PATH;
            return apogeeui.getResourcePath(resPath);
        }
    }

    /** This method returns the model manager for this component. */
    getModelView() {
        return this.modelView;
    }

    //-----------------------------------
    // Save methods
    //-----------------------------------
    
    /** This method will be called to prepare for a workspace save. It lets
     * the UI save its current state in the workspace. */
    prepareSave() {
        this.saveStateOnComponent();
    }

    
    /** This method reads the current UI state and saves it to the component. */
    saveStateOnComponent() {
        let json = {};
        let statePresent = false;

        //get the child display state
        let activeChildDisplayState;
        if(this.childComponentDisplay) {
            activeChildDisplayState = this.childComponentDisplay.getStateJson();
        }
        else {
            activeChildDisplayState = this.childDisplayState;
        }

        if(activeChildDisplayState !== undefined) {
            json.childDisplayState = activeChildDisplayState;
            statePresent = true;
        }
    
        //get the tree display state
        let activeTreeState;
        if(this.treeDisplay) {
            activeTreeState = this.treeDisplay.getState();
        }
        else {
            activeTreeState = this.treeState; 
        }

        if((activeTreeState !== undefined)&&(activeTreeState != TreeEntry.NO_CONTROL)) {
            json.treeState = activeTreeState;
            statePresent = true;
        }

        //allow the specific component implementation to write to the json
        if(this.writeToJson) {
            statePresent = this.writeToJson(json);
        }

        //store this state with the component
        if(statePresent) {
            this.component.setDisplayState(json);
        }
    }

    /** This method reads the UI state from the component. */
    loadStateFromComponent() {
        let json = this.component.getDisplayState();
        if(!json) return;

        //set the tree state
        if(json.treeState !== undefined) {
            if(this.treeDisplay) {
                this.treeDisplay.setState(json.treeState);
                this.treeState = undefined;
            }
            else {
                this.treeState = json.treeState;
            }
        }
        
        //set window options
        if(json.childDisplayState !== undefined) {
            if(this.childComponentDisplay) {
                this.childComponentDisplay.setState(json.childDisplayState);
                this.childDisplayState = undefined;
            }
            else {
                this.childDisplayState = json.childDisplayState;
            }
        }
        
        //allow the component implemnetation ro read from the json
        if(this.readFromJson) {
            this.readFromJson(json);
        }

    }

    /** This method can be implemented if the component view has additional state to save.
     * It should return true if state was added, and false otherwise. */
    //writeToJson(json) { return false;}

    /** This method can be implemented if the component view has additional state saved. */
    //readFromJson(json) {}


    //-------------------
    // tree entry methods - this is the element in the tree view
    //-------------------
//--- VIEW ITEM ---//
    getTreeEntry() {
        return this.treeDisplay.getTreeEntry();
    }

//--- VIEW ITEM ---//
    /** @protected */
    createTreeDisplay() {
        var treeDisplay = new TreeComponentDisplay(this);
        
        //default sort order within parent
        var treeEntrySortOrder = (this.constructor.TREE_ENTRY_SORT_ORDER !== undefined) ? this.constructor.TREE_ENTRY_SORT_ORDER : ComponentView.DEFAULT_COMPONENT_TYPE_SORT_ORDER;
        treeDisplay.setComponentTypeSortOrder(treeEntrySortOrder);
        
        return treeDisplay;
    }

    //-------------------
    // component display methods - this is the element in the parent tab (main display)
    //-------------------

//--- VIEW ITEM ---//
    getChildDisplayState() {
        return this.childDisplayState;
    }
//--- VIEW ITEM ---//
    setComponentDisplay(childComponentDisplay) {
        this.childComponentDisplay = childComponentDisplay; 
    }
//--- VIEW ITEM ---//
    getComponentDisplay() {
        return this.childComponentDisplay;
    }
//--- VIEW ITEM ---//
    closeComponentDisplay() {
        if(this.childComponentDisplay) {
            //first store the window state
            this.childDisplayState = this.childComponentDisplay.getStateJson();
            
            //delete the window
            this.childComponentDisplay.deleteDisplay();
            
            this.childComponentDisplay = null;
        }
    }

    //-------------------
    // tab display methods - this is the tab element, only used for parent members
    //-------------------
//--- VIEW ITEM ---//
    /** This indicates if the component has a tab display. */
    usesTabDisplay() {
        return this.constructor.hasTabEntry;
    }
//--- VIEW ITEM ---//
    //Implement in extending class:
    ///** This creates the tab display for the component. */
    //instantiateTabDisplay();
//--- VIEW ITEM ---//
    createTabDisplay() {
        if((this.usesTabDisplay())&&(!this.tabDisplay)) {
            if(this.modelView) { 
                this.tabDisplay = this.instantiateTabDisplay();

                //add the tab display to the tab frame
                var tab = this.tabDisplay.getTab();
                var tabFrame = this.modelView.getTabFrame();
                tabFrame.addTab(tab,true);
            }
        }
    }
//--- VIEW ITEM ---//
    getTabDisplay(createIfMissing) {
        return this.tabDisplay;
    }
//--- VIEW ITEM ---//
    /** This closes the tab display for the component. */
    closeTabDisplay() {
        if(this.tabDisplay) {
            var tabDisplay = this.tabDisplay;
            this.tabDisplay = null;
            tabDisplay.closeTab();
            tabDisplay.destroy();    
        }
    }

    //-------------------
    // Menu methods
    //-------------------
//--- VIEW ITEM ---// ???
    getMenuItems(optionalMenuItemList) {
        //menu items
        var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];

        if(this.component.getParentComponent()) {
            //these items are only possible for members with a parent.
            
            //add the standard entries
            var itemInfo = {};
            itemInfo.title = "Edit Properties";
            itemInfo.callback = () => updateComponent(this.component,this.constructor);
            menuItemList.push(itemInfo);

            var itemInfo = {};
            itemInfo.title = "Delete";
            itemInfo.callback = () => deleteComponent(this.component,this);
            menuItemList.push(itemInfo);
        }
        
        return menuItemList;
    }
//--- VIEW ITEM ---//
    getOpenMenuItem () {
        var openCallback = this.createOpenCallback();
        if(openCallback) {
            var itemInfo = {};
            itemInfo.title = "Open";
            itemInfo.callback = openCallback;
            return itemInfo;
        }
        else {
            return null;
        }
    }

    //==============================
    // Protected Instance Methods
    //==============================

    /** This method cleans up after a delete. Any extending object that has delete
     * actions should pass a callback function to the method "addClenaupAction" */
    onDelete() {
        
        //remove from parent
        if(this.uiActiveParent) {
            var parentComponent = this.modelManager.getComponent(this.uiActiveParent);
            if(parentComponent) {
                //remove the tree from the parent
                parentComponent.removeChildComponent(this);
            }
        }
        
        if(this.tabDisplay) {
            this.closeTabDisplay();
        }
        
        //execute cleanup actions
        for(var i = 0; i < this.cleanupActions.length; i++) {
            this.cleanupActions[i].call(this);
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    componentUpdated(eventInfo) {

        let fieldsUpdated = eventInfo.fieldsUpdated;

        // //check for parent change
        // if(apogeeutil.isFieldUpdated(fieldsUpdated,"owner")) {
                
        //     //old parent change logic!!!
        //     var oldParent = this.uiActiveParent;
        //     var newParent = this.member.getParent();

        //     this.uiActiveParent = newParent;

        //     //remove from old parent component
        //     if(oldParent) {
        //         var oldParentComponent = this.modelManager.getComponent(oldParent);
        //         oldParentComponent.removeChildComponent(this);
        //         //delete all the window display
        //         if(this.childComponentDisplay) {
        //             this.childComponentDisplay.deleteDisplay();
        //             this.childComponentDisplay = null;
        //         }
        //     }

        //     //add to the new parent component
        //     if(newParent) {
        //         var newParentComponent = this.modelManager.getComponent(newParent);
        //         newParentComponent.addChildComponent(this);

        //         //TODO - delete the current component display and add a new one
        //     }
        // }  
        
        //update for new data
        if(this.treeDisplay) {
            this.treeDisplay.componentUpdated(fieldsUpdated);
        }
        if(this.childComponentDisplay != null) {
            this.childComponentDisplay.componentUpdated(fieldsUpdated);
        }
        if(this.tabDisplay != null) {
            this.tabDisplay.componentUpdated(fieldsUpdated);
        }
    }

    /** This method is used for setting initial values in the property dialog. 
     * If there are additional property lines, in the generator, this method should
     * be extended to give the values of those properties too. */
    getPropertyValues() {
        
        var member = this.member;
        
        var values = {};
        values.name = member.getName();
        var parent = member.getParent();
        if(parent) {
            values.parentName = parent.getFullName();
        }

        if(member.generator.readProperties) {
            member.generator.readProperties(member,values);
        }
        if(this.readExtendedProperties) {
            this.readExtendedProperties(values);
        }
        return values;
    }

    //=============================
    // Action UI Entry Points
    //=============================
//--- VIEW ITEM ---//
    /** This method creates a callback for deleting the component. 
     *  @private */
    createOpenCallback() {
        var openCallback;
        
        var makeTabActive = function(tabComponent) {
            var tabDisplay = tabComponent.getTabDisplay();
            if(tabDisplay) {
                var tab = tabDisplay.getTab();
                tab.makeActive();
            }
            else {
                //create the tab display - this automaticaly puts it in the tab frame
                tabComponent.createTabDisplay();
            }
        }
        
        if(this.usesTabDisplay()) {
            openCallback = () => {
                makeTabActive(this);

                //allow time for UI to be created and then select start fo doc
                //this will also give the doc focus
                setTimeout(() => {
                    let tabDisplay = this.getTabDisplay();
                    if(tabDisplay.selectStartOfDocument) {
                        tabDisplay.selectStartOfDocument();
                    }
                },0);
            }
        }
        else {
            //remove the tree from the parent
            openCallback = () => {
                var parentComponent = this.getParentComponent();
                if((parentComponent)&&(parentComponent.usesTabDisplay())) {

                    //open the parent and bring this child to the front
                    makeTabActive(parentComponent);

                    //allow time for UI to be created and then show child
                    setTimeout(() => {
                        parentComponent.showChildComponent(this);
                    },0);

                }
            }
        }
        
        return openCallback;
    }
}

//These parameters are used to order the components in the tree entry.
ComponentView.DEFAULT_COMPONENT_TYPE_SORT_ORDER = 5;
ComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER = 0;

ComponentView.DEFAULT_ICON_RES_PATH = "/genericIcon.png";

ComponentView.MENU_ITEM_OPEN = 0x01;

