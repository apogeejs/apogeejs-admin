import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import apogeeui from "/apogeeui/apogeeui.js";
import {updateComponent} from "/apogeeview/commandseq/updatecomponentseq.js";
import {deleteComponent} from "/apogeeview/commandseq/deletecomponentseq.js";
import TreeComponentDisplay from "/apogeeview/componentdisplay/TreeComponentDisplay.js";
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";
import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 

/** This is the base functionality for a component. */
export default class Component extends EventManager {

    constructor(modelManager,member,componentGenerator) {

        super();
        
        this.modelManager = modelManager;
        this.member = member;
        this.uiActiveParent = null;
        this.componentGenerator = componentGenerator;
    
        this.modelManager.registerMember(this.member,this);
        
        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];
        
        //notifications
        this.bannerState = bannerConstants.BANNER_TYPE_NONE;
        this.bannerMessage = "";
        
        this.updated = {};
        
        //ui elements
        this.childComponentDisplay = null; //this is the main display, inside the parent tab
        this.childDisplayState = null;
        
        this.tabDisplay = null; //only valid on parents, which open into a tab
        
        this.treeDisplay = null; //this is shown in the tree view
        this.treeState = null;
    }

    /** If an extending object has any cleanup actions, a callback should be passed here.
     * The callback will be executed in the context of the current object. */
    addCleanupAction(cleanupFunction) {
        this.cleanupActions.push(cleanupFunction);
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This method returns the base member for this component. */
    getMember() {
        return this.member;
    }

    getName() {
        return this.member.getName();
    }

    getFullName() {
        return this.member.getFullName();
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath) {
        if(useFullPath) {
            return this.getFullName();
        }
        else {
            return this.getName();
        }
    }

    getParentComponent() {
        let parent = this.member.getParent();
        if(parent) {
            return this.modelManager.getComponent(parent);
        }
        else {
            return null;
        }
    }

//--- VIEW ITEM ---//
    /** This method returns the icon url for the component. */
    getIconUrl() {
        if(this.componentGenerator.ICON_URL) {
            return this.componentGenerator.ICON_URL;
        }
        else {
            var resPath = this.componentGenerator.ICON_RES_PATH;
            if(!resPath) resPath = Component.DEFAULT_ICON_RES_PATH;
            return apogeeui.getResourcePath(resPath);
        }
    }

    /** This method returns the workspace for this component. */
    getWorkspace() {
        return this.member.getWorkspace();
    }

    /** This method returns the model manager for this component. */
    getModelManager() {
        return this.modelManager;
    }

    //-------------------
    // tree entry methods - this is the element in the tree view
    //-------------------
//--- VIEW ITEM ---//
    getTreeEntry(createIfMissing) {
        if((createIfMissing)&&(!this.treeDisplay)) {
            this.treeDisplay = this.instantiateTreeEntry();
            this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);

            if(this.treeState !== undefined) {
                this.treeDisplay.setState(this.treeState);
            }
        }
        
        if(this.treeDisplay) {
            return this.treeDisplay.getTreeEntry();
        }
        else {
            return null;
        }
    }
//--- VIEW ITEM ---//
    /** @protected */
    instantiateTreeEntry() {
        var treeDisplay = new TreeComponentDisplay(this);
        
        //default sort order within parent
        var treeEntrySortOrder = (this.componentGenerator.TREE_ENTRY_SORT_ORDER !== undefined) ? this.componentGenerator.TREE_ENTRY_SORT_ORDER : Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER;
        treeDisplay.setComponentTypeSortOrder(treeEntrySortOrder);
        
        return treeDisplay;
    }

    //-------------------
    // component display methods - this is the element in the parent tab (main display)
    //-------------------
//--- VIEW ITEM ---//
    /** This indicates if the component has a tab display. */
    usesChildDisplay() {
        return this.componentGenerator.hasChildEntry;
    }
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
        return this.componentGenerator.hasTabEntry;
    }
//--- VIEW ITEM ---//
    //Implement in extending class:
    ///** This creates the tab display for the component. */
    //instantiateTabDisplay();
//--- VIEW ITEM ---//
    createTabDisplay() {
        if((this.usesTabDisplay())&&(!this.tabDisplay)) {
            let modelView = this.modelManager.getModelView();
            if(modelView) { 
                this.tabDisplay = this.instantiateTabDisplay();
                this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
                //add the tab display to the tab frame
                var tab = this.tabDisplay.getTab();
                var tabFrame = modelView.getTabFrame();
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

        if(this.member.getParent()) {
            //these items are only possible for members with a parent.
            
            //add the standard entries
            var itemInfo = {};
            itemInfo.title = "Edit Properties";
            itemInfo.callback = () => updateComponent(this);
            menuItemList.push(itemInfo);

            var itemInfo = {};
            itemInfo.title = "Delete";
            itemInfo.callback = () => deleteComponent(this);
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

    //------------------------------------------
    // Event Tracking Methods
    //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    getEventId() {
        //use the main member for the event ID
        return "component:" + this.member.getId();
    }

    getTargetType() {
        return "component";
    }


    //------------------
    // serialization
    //------------------

    /** This deserializes the component. */
    toJson() {
        var json = {};
        json.type = this.componentGenerator.uniqueName;
        
        if(this.childComponentDisplay != null) {
            this.childDisplayState = this.childComponentDisplay.getStateJson();
        }
        
        if(this.childDisplayState) {
            json.windowState = this.childDisplayState;
        }
        
        if(this.treeDisplay) {
            var treeState = this.treeDisplay.getState();
            if(treeState != TreeEntry.NO_CONTROL) {
                json.treeState = treeState;
            }
        }
        
        //allow the specific component implementation to write to the json
        if(this.writeToJson) {
            this.writeToJson(json);
        }
        
        return json;
    }

    /** This serializes the component. */
    loadPropertyValues(json) {
        if(!json) json = {};
        
        //take any immediate needed actions
        
        //set the tree state
        if(json.treeState !== undefined) {
            
            if(this.treeState != json.treeState) {
                this.fieldUpdated("treeState");
            }
            
            this.treeState = json.treeState; 
            
            if(this.treeDisplay) {
                this.treeDisplay.setState(this.treeState);
            }
        }
        
        //set window options
        if(json.windowState !== undefined) {
            
            if(this.childDisplayState != json.windowState) {
                this.fieldUpdated("childDisplayState");
            }
            
            this.childDisplayState = json.windowState;
        }
        
        //allow the component implemnetation ro read from the json
        if(this.readFromJson) {
            this.readFromJson(json);
        }
    }
    //==============================
    // Protected Instance Methods
    //==============================

    //This method should optionally be populated by an extending object.
    //** This method reads any necessary component implementation-specific data
    // * from the json. OPTIONAL */
    //readFromJson(json);

    //This method should optionally be populated by an extending object.
    //** This method writes any necessary component implementation-specific data
    // * to the json. OPTIONAL */
    //writeToJson(json);

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
    memberUpdated(eventInfo) {

        let updatedMember = eventInfo.target;
        let fieldsUpdated = eventInfo.updated;
        
        if(updatedMember.getId() == this.member.getId()) {
            this.fieldUpdated("member");
            
            //check for name changes
            if(apogeeutil.isFieldUpdated(fieldsUpdated,"name")) {
                this.fieldUpdated("name");
            }
            
            //check for parent change
            if(apogeeutil.isFieldUpdated(fieldsUpdated,"owner")) {
                this.fieldUpdated("owner");
                
                //old parent change logic!!!
                var oldParent = this.uiActiveParent;
                var newParent = this.member.getParent();

                this.uiActiveParent = newParent;

                //remove from old parent component
                if(oldParent) {
                    var oldParentComponent = this.modelManager.getComponent(oldParent);
                    oldParentComponent.removeChildComponent(this);
                    //delete all the window display
                    if(this.childComponentDisplay) {
                        this.childComponentDisplay.deleteDisplay();
                        this.childComponentDisplay = null;
                    }
                }

                //add to the new parent component
                if(newParent) {
                    var newParentComponent = this.modelManager.getComponent(newParent);
                    newParentComponent.addChildComponent(this);

                    //TODO - delete the current component display and add a new one
                }
            }  
            
            //check for banner update
            let newBannerState;
            let newBannerMessage;
            if(updatedMember.hasError()) {
                var errorMsg = "";
                var actionErrors = updatedMember.getErrors();
                for(var i = 0; i < actionErrors.length; i++) {
                    errorMsg += actionErrors[i].msg + "\n";
                }

                newBannerState = bannerConstants.BANNER_TYPE_ERROR;
                newBannerMessage = errorMsg;
            }
            else if(updatedMember.getResultPending()) {
                newBannerState = bannerConstants.BANNER_TYPE_PENDING;
                newBannerMessage = bannerConstants.PENDING_MESSAGE;

            }
            else if(updatedMember.getResultInvalid()) {
                newBannerState = bannerConstants.BANNER_TYPE_INVALID;
                newBannerMessage = bannerConstants.INVALID_MESSAGE;
            }
            else {   
                newBannerState = bannerConstants.BANNER_TYPE_NONE;
                newBannerMessage = null;
            }
            
            if((newBannerState != this.bannerState)||(newBannerMessage != this.bannerMessage)) {
                this.fieldUpdated("bannerState");
                this.bannerState = newBannerState;
                this.bannerMessage = newBannerMessage;
            }
        }
        else {
            this.fieldUpdated(updatedMember.getName());
            
            //for now we will assume the internal members do not have their name update!!!
            //maybe I should add a error check 
        }
        
        
        //update for new data
        if(this.treeDisplay) {
            this.treeDisplay.updateData();
            this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);
        }
        if(this.childComponentDisplay != null) {
            this.childComponentDisplay.updateData();
            this.childComponentDisplay.setBannerState(this.bannerState,this.bannerMessage);
        }
        if(this.tabDisplay != null) {
            this.tabDisplay.updateData();
            this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
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

    //======================================
    // Static methods
    //======================================

    /** This function creates a json to create the member for a new component instance. 
     * It uses default values and then overwrites in with optionalBaseValues (these are intended to be base values outside of user input values)
     * and then optionalOverrideValues (these are intended to be user input values) */
    static createMemberJson(componentGenerator,optionalInputProperties,optionalBaseValues) {
        var json = apogeeutil.jsonCopy(componentGenerator.DEFAULT_MEMBER_JSON);
        if(optionalBaseValues) {
            for(var key in optionalBaseValues) {
                json[key]= optionalBaseValues[key];
            }
        }
        if(optionalInputProperties) {
            //add the base component values
            if(optionalInputProperties.name !== undefined) json.name = optionalInputProperties.name;
            
            //add the specific member properties for this component type
            if(componentGenerator.transferMemberProperties) {
                componentGenerator.transferMemberProperties(optionalInputProperties,json);
            }
        }
        
        return json;
    }

    /** This function merges values from two objects containing component property values. */
    static createComponentJson(componentGenerator,optionalInputProperties,optionalBaseValues) {
        //copy the base properties
        var newPropertyValues = optionalBaseValues ? apogeeutil.jsonCopy(optionalBaseValues) : {};
        
        //set the type
        newPropertyValues.type = componentGenerator.uniqueName;
        
        //add in the input property Value
        if((optionalInputProperties)&&(componentGenerator.transferComponentProperties)) {
            componentGenerator.transferComponentProperties(optionalInputProperties,newPropertyValues);
        }
        
        return newPropertyValues;
    }


}

//These parameters are used to order the components in the tree entry.
Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER = 5;
Component.FOLDER_COMPONENT_TYPE_SORT_ORDER = 0;

Component.DEFAULT_ICON_RES_PATH = "/genericIcon.png";

Component.MENU_ITEM_OPEN = 0x01;

//======================================
// All components should have a generator to create the component
// from a json. See existing components for examples.
//======================================
