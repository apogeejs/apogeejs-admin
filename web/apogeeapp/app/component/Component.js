/** This is the base functionality for a component. */
apogeeapp.app.Component = function(workspaceUI,member,componentGenerator) {
    
    this.workspaceUI = workspaceUI;
    this.member = member;
    this.uiActiveParent = null;
    this.componentGenerator = componentGenerator;
   
    this.workspaceUI.registerMember(this.member,this);
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.cleanupActions = [];
    
    //notifications
    this.bannerState = apogeeapp.app.banner.BANNER_TYPE_NONE;
    this.bannerMessage = "";
    
    //ui elements
    this.childComponentDisplay = null; //this is the main display, inside the parent tab
    this.childComponentDisplayStateJson = null;
    
    this.tabDisplay = null; //only valid on parents, which open into a tab
    this.tabDisplayStateJson = null;
    
    this.treeDisplay = null; //this is shown in the tree view
    this.treeStateJson = null;
}

//These parameters are used to order the components in the tree entry.
apogeeapp.app.Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER = 5;
apogeeapp.app.Component.FOLDER_COMPONENT_TYPE_SORT_ORDER = 0;

/** If an extending object has any cleanup actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
apogeeapp.app.Component.prototype.addCleanupAction = function(cleanupFunction) {
    this.cleanupActions.push(cleanupFunction);
}

apogeeapp.app.Component.DEFAULT_ICON_RES_PATH = "/genericIcon.png";

apogeeapp.app.Component.MENU_ITEM_OPEN = 0x01;


//==============================
// Public Instance Methods
//==============================

/** This method returns the base member for this component. */
apogeeapp.app.Component.prototype.getMember = function() {
    return this.member;
}

/** This method returns the icon url for the component. */
apogeeapp.app.Component.prototype.getIconUrl = function() {
    if(this.componentGenerator.ICON_URL) {
        return this.componentGenerator.ICON_URL;
    }
    else {
        var resPath = this.componentGenerator.ICON_RES_PATH;
        if(!resPath) resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
        return apogeeapp.ui.getResourcePath(resPath);
    }
}

/** This method returns the workspace for this component. */
apogeeapp.app.Component.prototype.getWorkspace = function() {
    return this.member.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
apogeeapp.app.Component.prototype.getWorkspaceUI = function() {
    return this.workspaceUI;
}

//-------------------
// tree entry methods - this is the element in the tree view
//-------------------

apogeeapp.app.Component.prototype.getTreeEntry = function(createIfMissing) {
    if((createIfMissing)&&(!this.treeDisplay)) {
        this.treeDisplay = this.instantiateTreeEntry();
        this.treeDisplay.setBannerState(this.bannerState,this.bannerMessage);

        if(this.treeStateJson !== undefined) {
            this.treeDisplay.setState(this.treeStateJson);
        }
    }
    
    if(this.treeDisplay) {
        return this.treeDisplay.getTreeEntry();
    }
    else {
        return null;
    }
}

/** @protected */
apogeeapp.app.Component.prototype.instantiateTreeEntry = function() {
    var treeDisplay = new apogeeapp.app.TreeComponentDisplay(this);
    
    //default sort order within parent
    var treeEntrySortOrder = (this.componentGenerator.TREE_ENTRY_SORT_ORDER !== undefined) ? this.componentGenerator.TREE_ENTRY_SORT_ORDER : apogeeapp.app.Component.DEFAULT_COMPONENT_TYPE_SORT_ORDER;
    treeDisplay.setComponentTypeSortOrder(treeEntrySortOrder);
    
    return treeDisplay;
}

//-------------------
// component display methods - this is the element in the parent tab (main display)
//-------------------

apogeeapp.app.Component.prototype.getComponentDisplayOptions = function() {
    return this.childComponentDisplayStateJson;
}

apogeeapp.app.Component.prototype.setComponentDisplay = function(childComponentDisplay) {
    this.childComponentDisplay = childComponentDisplay; 
}

apogeeapp.app.Component.prototype.getComponentDisplay = function() {
    return this.childComponentDisplay;
}

apogeeapp.app.Component.prototype.closeComponentDisplay = function() {
    if(this.childComponentDisplay) {
        //first store the window state
        this.childComponentDisplayStateJson = this.childComponentDisplay.getStateJson();
        
        //delete the window
        this.childComponentDisplay.deleteDisplay();
        
        this.childComponentDisplay = null;
    }
}

//-------------------
// tab display methods - this is the tab element, only used for parent members
//-------------------

//Implement in extending class:
///** This indicates if the component has a tab display. */
//apogeeapp.app.Component.prototype.usesTabDisplay = function();

//Implement in extending class:
///** This creates the tab display for the component. */
//apogeeapp.app.Component.prototype.instantiateTabDisplay = function();

apogeeapp.app.Component.prototype.createTabDisplay = function() {
    if((this.usesTabDisplay())&&(!this.tabDisplay)) {
        this.tabDisplay = this.instantiateTabDisplay();
        if(this.tabDisplayStateJson) this.tabDisplay.setStateJson(this.tabDisplayStateJson);
        this.tabDisplay.setBannerState(this.bannerState,this.bannerMessage);
        //add the tab display to the tab frame
        var tab = this.tabDisplay.getTab();
        var tabFrame = this.workspaceUI.getTabFrame();
        tabFrame.addTab(tab,true);
    }
    return this.tabDisplay;
}

apogeeapp.app.Component.prototype.getTabDisplay = function(createIfMissing) {
    return this.tabDisplay;
}

/** This closes the tab display for the component. */
apogeeapp.app.Component.prototype.closeTabDisplay = function() {
    if(this.tabDisplay) {
        this.tabDisplayStateJson = this.tabDisplay.getStateJson();
        var tabDisplay = this.tabDisplay;
        this.tabDisplay = null;
        tabDisplay.closeTab();
        tabDisplay.destroy();    
    }
}

//-------------------
// Menu methods
//-------------------

apogeeapp.app.Component.prototype.getMenuItems = function(optionalMenuItemList) {
    //menu items
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];

    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = apogeeapp.app.updatecomponent.getUpdateComponentCallback(this);
    menuItemList.push(itemInfo);

    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    menuItemList.push(itemInfo);
    
    return menuItemList;
}

apogeeapp.app.Component.prototype.getOpenMenuItem = function() {
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

//------------------
// serialization
//------------------

/** This deserializes the component. */
apogeeapp.app.Component.prototype.toJson = function() {
    var json = {};
    json.type = this.componentGenerator.uniqueName;
    
    if(this.childComponentDisplay != null) {
        this.childComponentDisplayStateJson = this.childComponentDisplay.getStateJson();
    }
    
    if(this.childComponentDisplayStateJson) {
        json.windowState = this.childComponentDisplayStateJson;
    }
    
    if(this.usesTabDisplay) {
        if(this.tabDisplay != null) {
            this.tabDisplayStateJson = this.tabDisplay.getStateJson();
            json.tabOpen = true;
        }
        
        if(this.tabDisplayStateJson) {
            json.tabState = this.tabDisplayStateJson;
        }
    }
    
    if(this.treeDisplay) {
        var treeState = this.treeDisplay.getState();
        if(treeState != apogeeapp.ui.treecontrol.NO_CONTROL) {
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
apogeeapp.app.Component.prototype.loadSerializedValues = function(json) {
    if(!json) json = {};
    
    //take any immediate needed actions
    
    //set the tree state
    if(json.treeState !== undefined) {
        this.treeStateJson = json.treeState; 
        
        if(this.treeDisplay) {
            this.treeDisplay.setState(this.treeStateJson);
        }
    }
    
    //open the tab - if tab frame exists
    if(this.usesTabDisplay()) {
        if(json.tabState) {
            this.tabDisplayStateJson = json.tabState;
        }
    }
    
    //set window options
    if(json.windowState !== undefined) {
        this.childComponentDisplayStateJson = json.windowState;
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
//apogeeapp.app.Component.prototype.readFromJson = function(json);

//This method should optionally be populated by an extending object.
//** This method writes any necessary component implementation-specific data
// * to the json. OPTIONAL */
//apogeeapp.app.Component.prototype.writeToJson = function(json);

//This method should optionally be populated by an extending object.
//** This method adds any necessary implementation-specific property
// * key value pairs to the passed in the json. OPTIONAL */
//apogeeapp.app.Component.prototype.addPropFunction = function(values);

//This method should optionally be populated by an extending object.
//** This method gets updated component implementation-specific properties from 
// * the passed in newValues. OldValues will be the original values passed back
// to this function. OPTIONAL */
//apogeeapp.app.Component.prototype.updateProperties = function(oldValues,newValues);

/** This method cleans up after a delete. Any extending object that has delete
 * actions should pass a callback function to the method "addClenaupAction" */
apogeeapp.app.Component.prototype.onDelete = function() {
    
    //remove from parent
    if(this.uiActiveParent) {
        var parentComponent = this.workspaceUI.getComponent(this.uiActiveParent);
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
apogeeapp.app.Component.prototype.memberUpdated = function() {
    //check for change of parent
    if(this.member.getParent() !== this.uiActiveParent) {
        var oldParent = this.uiActiveParent;
        var newParent = this.member.getParent();
       
        this.uiActiveParent = newParent;
        
        //remove from old parent component
        if(oldParent) {
            var oldParentComponent = this.workspaceUI.getComponent(oldParent);
            oldParentComponent.removeChildComponent(this);
            //delete all the window display
            if(this.childComponentDisplay) {
                this.childComponentDisplay.deleteDisplay();
                this.childComponentDisplay = null;
            }
        }
        
        //add to the new parent component
        if(newParent) {
            var newParentComponent = this.workspaceUI.getComponent(newParent);
            newParentComponent.addChildComponent(this);
            
            //TODO - delete the current component display and add a new one
        }
    }
    
    //get the banner info
    var member = this.getMember();
    if(member.hasError()) {
        var errorMsg = "";
        var actionErrors = member.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.bannerState = apogeeapp.app.banner.BANNER_TYPE_ERROR;
        this.bannerMessage = errorMsg;
    }
    else if(member.getResultPending()) {
        this.bannerState = apogeeapp.app.banner.BANNER_TYPE_PENDING;
        this.bannerMessage = apogeeapp.app.banner.PENDING_MESSAGE;
        
    }
    else if(member.getResultInvalid()) {
        this.bannerState = apogeeapp.app.banner.BANNER_TYPE_INVALID;
        this.bannerMessage = apogeeapp.app.banner.INVALID_MESSAGE;
    }
    else {   
        this.bannerState = apogeeapp.app.banner.BANNER_TYPE_NONE;
        this.bannerMessage = null;
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
apogeeapp.app.Component.prototype.getPropertyValues = function() {
    
    var member = this.member;
    
    var values = {};
    values.name = member.getName();
    var parent = member.getParent();
    if(parent) {
        values.parentName = parent.getFullName();
    }

    if(member.generator.addPropFunction) {
        member.generator.addPropFunction(member,values);
    }
    if(this.addPropFunction) {
        this.addPropFunction(values);
    }
    return values;
}

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for deleting the component. 
 *  @private */
apogeeapp.app.Component.prototype.createOpenCallback = function() {
    var instance = this;
    var openCallback;
    var workspaceUI = this.workspaceUI;
    
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
        openCallback = function() {
            makeTabActive(instance);
        }
    }
    else {
        //remove the tree from the parent
        openCallback = function() {
            var parent = instance.member.getParent();
            if(parent) {
                var parentComponent = workspaceUI.getComponent(parent);
                if((parentComponent)&&(parentComponent.usesTabDisplay())) {

                    //open the parent and bring this child to the front
                    makeTabActive(parentComponent);
                    parentComponent.showChildComponent(instance);
                }
            }
        }
    }
    
    return openCallback;
}

/** This method creates a callback for deleting the component. 
 *  @private */
apogeeapp.app.Component.prototype.createDeleteCallback = function() {
    var member = this.getMember();
    return function() {
        var doDelete = confirm("Are you sure you want to delete this object?");
        if(!doDelete) {
            return;
        }
        
        //delete the object - the component we be deleted after the delete event received
        var workspace = member.getWorkspace();
        var memberFullName = member.getFullName();
        var actionResponse = apogeeapp.app.addcomponent.doDeleteComponent(workspace,memberFullName);

        if(!actionResponse.getSuccess()) {
            //show an error message
            apogeeapp.app.errorHandling.handleActionError(actionResponse);
        }
    }
}

//======================================
// Static methods
//======================================

/** This creates a component from a member along with two sources of data for the component, the serialized values
 * and propertyValues. Both of these are optional. Typically serializaed values are used when we are opening the
 * component from a saved state and property values are used when we are creating a new component where the 
 * users filled out a dialog populating the properties.
 * 
 * @param {type} componentGenerator - This is the generator for the component
 * @param {type} workspaceUI - this is the workspace UI in which we wil create the component
 * @param {type} member - this is the member associated with the component
 * @param {type} propertyValues - (optional) these are property values, which may be used to create the component (like when it is loaded from a create dialog)
 * @param {type} serializedValues - (optional) these are serialized values for the componnet, (like when it is loaded from a serialized json)
 * @returns the component created
 */
apogeeapp.app.Component.createComponentFromMember = function(componentGenerator,workspaceUI,member,propertyValues,serializedValues) {
    
    //create empty component
    var component = new componentGenerator(workspaceUI,member);

    //apply any serialized values
    if(serializedValues) {
        component.loadSerializedValues(serializedValues);
    }
    
    //apply any user input (property dialog) values
    if((propertyValues)&&(component.updateProperties)) {
        component.updateProperties(null,propertyValues);
    }

    //call member updated to process and notify of component creation
    component.memberUpdated();
    
    return component;
}

//======================================
// All components should have a generator to create the component
// from a json. See existing components for examples.
//======================================
