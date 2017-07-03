/** This is the base functionality for a component. */
apogeeapp.app.Component = function(workspaceUI,object,generator,options) {
    
    if(!options) {
        options = {};
    }
    this.options = options;
    
    this.workspaceUI = workspaceUI;
    this.object = object;
    this.uiActiveParent = null;
    this.generator = generator;
   
    this.workspaceUI.registerMember(this.object,this);

    this.windowDisplay = null;
    this.windowDisplayStateJson = this.options.windowState;
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.saveActions = [];
    this.cleanupActions = [];
    
    //-------------
    //create tree entry
    //-------------
    this.treeDisplay = new apogeeapp.app.TreeComponentDisplay(this);
}

/** If an extending object has any save actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
apogeeapp.app.Component.prototype.addSaveAction = function(saveFunction) {
    this.saveActions.push(saveFunction);
}

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
apogeeapp.app.Component.prototype.getObject = function() {
    return this.object;
}

/** This method returns the icon url for the component. */
apogeeapp.app.Component.prototype.getIconUrl = function() {
    if(this.generator.ICON_URL) {
        return this.generator.ICON_URL;
    }
    else {
        var resPath = this.generator.ICON_RES_PATH;
        if(!resPath) resPath = apogeeapp.app.Component.DEFAULT_ICON_RES_PATH;
        return apogeeapp.ui.getResourcePath(resPath);
    }
}

/** This method returns the workspace for this component. */
apogeeapp.app.Component.prototype.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
apogeeapp.app.Component.prototype.getWorkspaceUI = function() {
    return this.workspaceUI;
}

apogeeapp.app.Component.prototype.getTreeEntry = function() {
    return this.treeDisplay.getTreeEntry();
}

//implement
//apogeeapp.app.Component.prototype.createWindowDisplay = function();

apogeeapp.app.Component.prototype.closeWindowDisplay = function() {
    if(this.windowDisplay) {
        //first store the window state
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
        
        //delete the window
        this.windowDisplay.deleteDisplay();
    }
}

apogeeapp.app.Component.prototype.getWindowDisplay = function() {
    return this.windowDisplay;
}

apogeeapp.app.Component.prototype.getMenuItems = function(flags,optionalMenuItemList) {
    //menu items
    var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];

    if(flags & apogeeapp.app.Component.MENU_ITEM_OPEN) {
        var openCallback = this.createOpenCallback();
        if(openCallback) {
            var itemInfo = {};
            itemInfo.title = "Open";
            itemInfo.callback = openCallback;
            menuItemList.push(itemInfo);
        }
    }

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


//Implement in extending class:
///** This indicates if the component has a tab display. */
//apogeeapp.app.Component.prototype.hasTabDisplay = function();

//Implement in extending class:
///** This opens the tab display for the component. */
//apogeeapp.app.Component.prototype.openTabDisplay = function();

//Implement in extending class:
///** This closes the tab display for the component. */
//apogeeapp.app.Component.prototype.closeTabDisplay = function();

/** This serializes the component. */
apogeeapp.app.Component.prototype.toJson = function() {
    var json = {};
    json.type = this.generator.uniqueName;
    
    if(this.windowDisplay != null) {
        this.windowDisplayStateJson = this.windowDisplay.getStateJson();
    }
    
    if(this.windowDisplayStateJson) {
        json.windowState = this.windowDisplayStateJson;
    }
    
    for(var i = 0; i < this.saveActions.length; i++) {
        this.saveActions[i].call(this,json);
    }
    
    return json;
}

//==============================
// Protected Instance Methods
//==============================


//This method should be populated by an extending object.
//** This serializes the table component. */
//apogeeapp.app.Component.prototype.writeToJson = function(json);

//This method should be populated by an extending object iof it needs to add any UI elements
// to the frame.
//** This method populates the frame for this component. */
//apogeeapp.app.Component.populateFrame = function();

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
    if(this.object.getParent() !== this.uiActiveParent) {
        var oldParent = this.uiActiveParent;
        var newParent = this.object.getParent();
       
        this.uiActiveParent = newParent;
        
        //remove from old parent component
        if(oldParent) {
            var oldParentComponent = this.workspaceUI.getComponent(oldParent);
            oldParentComponent.removeChildComponent(this);
            //delete all the window display
            if(this.windowDisplay) {
                this.windowDisplay.deleteDisplay();
                this.windowDisplay = null;
            }
        }
        
        //add to the new parent component
        if(newParent) {
            var newParentComponent = this.workspaceUI.getComponent(newParent);
            newParentComponent.addChildComponent(this);
        }
    }
    
    //get the banner info
    var bannerState;
    var bannerMessage;
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
        bannerMessage = errorMsg;
    }
    else if(object.getResultPending()) {
        bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
        bannerMessage = apogeeapp.app.WindowHeaderManager.PENDING_MESSAGE;
        
    }
    else {   
        bannerState = apogeeapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
        bannerMessage = null;
    }
    
    //update for new data
    this.treeDisplay.updateData();
    this.treeDisplay.setBannerState(bannerState,bannerMessage);
    if(this.windowDisplay != null) {
        this.windowDisplay.updateData();
        this.windowDisplay.setBannerState(bannerState,bannerMessage);
    }
    if(this.tabDisplay != null) {
        this.tabDisplay.updateData();
        this.tabDisplay.setBannerState(bannerState,bannerMessage);
    }
}

/** This method is used for setting initial values in the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to give the values of those properties too. */
apogeeapp.app.Component.prototype.getPropertyValues = function() {
    
    var member = this.object;
//    var generator = member.generator;
    
    var values = {};
    values.name = member.getName();
    var parent = member.getParent();
    if(parent) {
        values.parentName = parent.getFullName();
    }

    if(member.generator.addPropFunction) {
        member.generator.addPropFunction(member,values);
    }
    if(this.generator.addPropFunction) {
        this.generator.addPropFunction(this,values);
    }
    return values;
}

///** This method shoudl be implemented by an extending class to create a component
// * display, given a container, for the component. */
//apogeeapp.app.Component.prototype.createDisplayContent = function(container);

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for deleting the component. 
 *  @private */
apogeeapp.app.Component.prototype.createOpenCallback = function() {
    var instance = this;
    var openCallback;
    
    if(this.hasTabDisplay()) {
        openCallback = function() {
            instance.openTabDisplay();
        }
    }
    else {
        var parent = this.object.getParent();
        if(parent) {
            var parentComponent = this.workspaceUI.getComponent(parent);
            if((parentComponent)&&(parentComponent.hasTabDisplay())) {
                //remove the tree from the parent
                openCallback = function() {
                    //open the parent
                    parentComponent.openTabDisplay();
                    
                    //bring thsi child to the front
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
    var object = this.getObject();
    return function() {
        var doDelete = confirm("Are you sure you want to delete this object?");
        if(!doDelete) {
            return;
        }
        
        //delete the object - the component we be deleted after the delete event received
        var json = {};
        json.action = "deleteMember";
        json.member = object;
        var actionResponse = apogee.action.doAction(json);

        if(!actionResponse.getSuccess()) {
            //show an error message
            var msg = actionResponse.getErrorMsg();
            alert(msg);
        }
    }
}

//======================================
// All components should have a generator to register the component, as below
//======================================
//
//apogeeapp.app.JsonTableComponent.generator = {};
//apogeeapp.app.JsonTableComponent.generator.displayName = "JSON Table";
//apogeeapp.app.JsonTableComponent.generator.uniqueName = "apogeeapp.app.JsonTableComponent";
//apogeeapp.app.JsonTableComponent.generator.createComponent = apogeeapp.app.JsonTableComponent.createComponent;
//apogeeapp.app.JsonTableComponent.generator.createComponentFromJson = apogeeapp.app.JsonTableComponent.createComponentFromJson;
//apogeeapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
//apogeeapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;
//apogeeapp.app.JsonTableComponent.generator.ICON_RES_PATH = "path to icon in resource directory";
//apogeeapp.app.JsonTableComponent.generator.ICON_URL = "absolute icon url";