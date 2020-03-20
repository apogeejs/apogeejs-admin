import apogeeui from "/apogeeui/apogeeui.js";
import {updateComponent} from "/apogeeview/commandseq/updatecomponentseq.js";
import {deleteComponent} from "/apogeeview/commandseq/deletecomponentseq.js";
import TreeComponentDisplay from "/apogeeview/componentdisplay/TreeComponentDisplay.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js"; 

/** This is the base functionality for a component. */
export default class ComponentView {

    constructor(modelView,component) {
        
        this.modelView = modelView;
        this.component = component;
        //this is to record the latest parent view to which this was added
        this.lastAssignedParentComponentView = null;
        
        //ui elements
        this.childComponentDisplay = null; //this is the main display, inside the parent tab
        this.childDisplayState = null;
        
        this.tabDisplay = null; //only valid on parents, which open into a tab
        
        this.treeDisplay = this.createTreeDisplay(); //this is shown in the tree view
        this.treeState = null;

        this.component.setViewStateCallback(() => this.getViewState());
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

    getFullName(model) {
        return this.component.getFullName(model);
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath,modelForFullPathOnly) {
        return this.component.getDisplayName(useFullPath,modelForFullPathOnly);
    }

    /** This method returns true if the display name field is updated. It is only applicable if 
     * the full path is NOT used. */
    isDisplayNameUpdated() {
        return this.component.isDisplayNameUpdated();
    }

    getBannerState() {
        let member = this.component.getMember();
        return member.getState();
    }

    getBannerMessage() {
        let member = this.component.getMember();
        let state =  member.getState();
        switch(state) {
            case apogeeutil.STATE_NORMAL:
                return "";

            case apogeeutil.STATE_PENDING:
                return bannerConstants.PENDING_MESSAGE;

            case apogeeutil.STATE_INVALID:
                return bannerConstants.INVALID_MESSAGE;

            case apogeeutil.STATE_ERROR:
                return member.getErrorMsg();

            default:
                return "Unknown state: " + state; 
        }
    }

    /** This method gets the parent component view of the current component view. 
     * This method does not depends only on the relation between the components, 
     * rather than any relationship established between the component views. This should give the
     * same result getLastAssignedParentComponentView except during a delete or move operation. */
    getParentComponentView() {

        let parentComponent = this.component.getParentComponent(this.modelView.getModelManager());
        if(parentComponent) {
            return this.modelView.getComponentViewByComponentId(parentComponent.getId());
        }
        else {
            return null;
        }

    }

    /** This sets the assigned parent component view. This should be done for
     * bookkeeping so it can be removed suring a move or delete operation. */
    setLastAssignedParentComponentView(parentComponentView) {
        this.lastAssignedParentComponentView = parentComponentView;

    }

    /** This method gets the assigned parent component view, which may not
     * be the view corresponding to the current parent component. This should differ 
     * only during move or delete operations. */
    getLastAssignedParentComponentView() {
        return this.lastAssignedParentComponentView;

    }

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

    /** This method is called when the workspace is closing */
    closeWorkspace() {
        this.onDelete();
    }

    //-----------------------------------
    // Save methods
    //-----------------------------------

    
    /** This method reads the current UI state and saves it to the component. */
    getViewState() {
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

        if(this.tabDisplay) {
            json.tabOpened = true;
            var tab = this.tabDisplay.getTab();
            if(tab.getIsShowing()) {
                json.tabShowing = true;
            }
            statePresent = true;
        }

        //return the state
        if(statePresent) {
            return json;
        }
        else {
            return undefined;
        }
    }

    /** This method reads the UI state from the component. */
    loadViewStateFromComponent() {
        let json = this.component.getCachedViewState();
        if(!json) return;

        //set the tree state
        if((json.treeState !== undefined)||(json.treeState !== null)) {
            if(this.treeDisplay) {
                this.treeDisplay.setState(json.treeState);
                this.treeState = null;
            }
            else {
                this.treeState = json.treeState;
            }
        }
        
        //set window options
        if((json.childDisplayState !== undefined)||(json.childDisplayState !== null)) {
            if(this.childComponentDisplay) {
                this.childComponentDisplay.setStateJson(json.childDisplayState);
                this.childDisplayState = null;
            }
            else {
                this.childDisplayState = json.childDisplayState;
            }
        }
        
        //allow the component implemnetation ro read from the json
        if(this.readFromJson) {
            this.readFromJson(json);
        }

        //check the tab display state (where tabs are used)
        if(json.tabOpened) {
            let setShowing = json.tabShowing;
            this.createTabDisplay(setShowing);
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
    getTreeEntry() {
        return this.treeDisplay.getTreeEntry();
    }

    /** @protected */
    createTreeDisplay() {
        var treeDisplay = new TreeComponentDisplay(this);

        if(this.treeState !== null) {
            treeDisplay.setState(this.treeState);
        }
        
        //default sort order within parent
        var treeEntrySortOrder = (this.constructor.TREE_ENTRY_SORT_ORDER !== undefined) ? this.constructor.TREE_ENTRY_SORT_ORDER : ComponentView.DEFAULT_COMPONENT_TYPE_SORT_ORDER;
        treeDisplay.setComponentTypeSortOrder(treeEntrySortOrder);
        
        return treeDisplay;
    }

    //-------------------
    // component display methods - this is the element in the parent tab (main display)
    //-------------------

    setComponentDisplay(childComponentDisplay) {
        this.childComponentDisplay = childComponentDisplay; 
        if(this.childDisplayState) {
            this.childComponentDisplay.setStateJson(this.childDisplayState);
            this.childDisplayState = null;
        }
    }

    getComponentDisplay() {
        return this.childComponentDisplay;
    }

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

    /** This indicates if the component has a tab display. */
    usesTabDisplay() {
        return this.constructor.hasTabEntry;
    }
    //Implement in extending class:
    ///** This creates the tab display for the component. */
    //instantiateTabDisplay();

    createTabDisplay(makeActive) {
        if((this.usesTabDisplay())&&(!this.tabDisplay)) {
            if(this.modelView) { 
                this.tabDisplay = this.instantiateTabDisplay();

                //add the tab display to the tab frame
                var tab = this.tabDisplay.getTab();
                var tabFrame = this.modelView.getTabFrame();
                tabFrame.addTab(tab,makeActive);
            }
        }
    }

    getTabDisplay() {
        return this.tabDisplay;
    }

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

    getMenuItems(optionalMenuItemList) {
        //menu items
        var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];

        if(this.component.getParentComponent(this.modelView.getModelManager())) {
            //these items are only possible for members with a parent.
            
            //add the standard entries
            var itemInfo = {};
            itemInfo.title = "Edit Properties";
            itemInfo.callback = () => updateComponent(this.component,this);
            menuItemList.push(itemInfo);

            var itemInfo = {};
            itemInfo.title = "Delete";
            itemInfo.callback = () => deleteComponent(this.component,this);
            menuItemList.push(itemInfo);
        }
        
        return menuItemList;
    }

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
        if(this.tabDisplay) {
            this.closeTabDisplay();
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    componentUpdated(component) {

        //check for parent change
        if(component.isFieldUpdated("member")) {
            let member = component.getMember();
            if(member.isFieldUpdated("ownerId")) {
                var oldParentComponentView = this.lastAssignedParentComponentView;
                var newParentComponentView = this.getParentComponentView();

                if(oldParentComponentView != newParentComponentView) {
                    //remove from old parent component
                    if(oldParentComponentView) {
                        oldParentComponentView.removeChild(this);
                        //delete all the window display
                        if(this.childComponentDisplay) {
                            this.childComponentDisplay.deleteDisplay();
                            this.childComponentDisplay = null;
                        }
                    }

                    //add to the new parent component
                    if(newParentComponentView) {
                        newParentComponentView.addChild(this);
                    }
                }
            }  
        }
        
        //update for new data
        if(this.treeDisplay) {
            this.treeDisplay.componentUpdated(component);
        }
        if(this.childComponentDisplay != null) {
            this.childComponentDisplay.componentUpdated(component);
        }
        if(this.tabDisplay != null) {
            this.tabDisplay.componentUpdated(component);
        }
    }

    //=============================
    // Action UI Entry Points
    //=============================

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
                tabComponent.createTabDisplay(true);
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
                var parentComponentView = this.getParentComponentView();
                if((parentComponentView)&&(parentComponentView.constructor.hasTabEntry)) {

                    //open the parent and bring this child to the front
                    makeTabActive(parentComponentView);

                    parentComponentView.showChild(this);

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

