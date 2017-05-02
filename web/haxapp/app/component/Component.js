/** This is a mixin that encapsulates the base functionality of a Component
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
haxapp.app.Component = {};
    
/** This is the initializer for the component. The object passed is the core object
 * associated with this component. */
haxapp.app.Component.init = function(workspaceUI,object,generator,options) {
    
    if(!options) {
        options = {};
    }
    
    this.workspaceUI = workspaceUI;
    this.object = object;
    this.uiActiveParent = null;
    this.generator = generator;
   
    this.workspaceUI.registerMember(this.object,this);

    this.windowDisplay = null;
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.saveActions = [];
    this.cleanupActions = [];
    
    //-------------
    //create tree entry
    //-------------
    this.treeDisplay = new haxapp.app.TreeComponentDisplay(this);
}

/** If an extending object has any save actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
haxapp.app.Component.addSaveAction = function(saveFunction) {
    this.saveActions.push(saveFunction);
}

/** If an extending object has any cleanup actions, a callback should be passed here.
 * The callback will be executed in the context of the current object. */
haxapp.app.Component.addCleanupAction = function(cleanupFunction) {
    this.cleanupActions.push(cleanupFunction);
}


//==============================
// Public Instance Methods
//==============================

/** This method returns the base member for this component. */
haxapp.app.Component.getObject = function() {
    return this.object;
}

/** This method returns the workspace for this component. */
haxapp.app.Component.getWorkspace = function() {
    return this.object.getWorkspace();
}

/** This method returns the workspaceUI for this component. */
haxapp.app.Component.getWorkspaceUI = function() {
    return this.workspaceUI;
}

haxapp.app.Component.getTreeEntry = function() {
    return this.treeDisplay.getTreeEntry();
}

haxapp.app.Component.getWindowDisplay = function() {
    if(this.windowDisplay == null) {
        this.windowDisplay = new haxapp.app.WindowComponentDisplay(this);
    }
    return this.windowDisplay;
}

/** This serializes the component. */
haxapp.app.Component.toJson = function() {
    var json = {};
    json.type = this.generator.uniqueName;
    
    json.coordInfo = this.window.getCoordinateInfo();
    json.windowState = this.window.getWindowState();
    
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
//haxapp.app.Component.prototype.writeToJson = function(json);

//This method should be populated by an extending object iof it needs to add any UI elements
// to the frame.
//** This method populates the frame for this component. */
//haxapp.app.Component.populateFrame = function();

/** This method cleans up after a delete. Any extending object that has delete
 * actions should pass a callback function to the method "addClenaupAction" */
haxapp.app.Component.onDelete = function() {
    //-----------------------------------------------------------------------------------
    //start
    
    //check for change of parent
    if(this.object.getParent() !== this.uiActiveParent) {
        var oldParent = this.uiActiveParent;
        var newParent = this.object.getParent();
       
        this.uiActiveParent = newParent;
        
        //remove from old parent component
        if(oldParent) {
            var oldParentComponent = this.workspaceUI.getComponent(oldParent);
            oldParentComponent.removeChildComponent(this);
            //delete all the old windows
            for(var i = 0; i < this.windowDisplays.length; i++) {
                this.windowDisplays[i].deleteWindow();
            }
            this.windowDisplays = [];
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
        
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
        bannerMessage = errorMsg;
    }
    else if(object.getResultPending()) {
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
        bannerMessage = haxapp.app.WindowHeaderManager.PENDING_MESSAGE;
        
    }
    else {   
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
        bannerMessage = null;
    }
    
    //update for new data
    this.treeDisplay.updateData();
    this.treeDisplay.setBannerState(bannerState,bannerMessage);
    
    if(this.windowDisplay != null) {
        this.windowDisplay.updateData();
        this.windowDisplay.setBannerState(bannerState,bannerMessage);
    }
    
    //end
    //-------------------------------------------------------------------------------------
    
    
    
    
    //remove the UI element
//    var componentWindow = this.getWindow();
//    componentWindow.deleteWindow();
    
    //TREE_ENTRY - remove tree entry from the parent
    if(this.uiActiveParent) {
        var parentComponent = this.workspaceUI.getComponent(this.uiActiveParent);
        if(parentComponent) {
            var parentTreeEntry = parentComponent.getTreeEntry();
            parentTreeEntry.removeChild(this.getObject().getId());
        }
    }
    
    //execute cleanup actions
    for(var i = 0; i < this.cleanupActions.length; i++) {
        this.cleanupActions[i].call(this);
    }
}

/** This method extends the member udpated function from the base.
 * @protected */    
haxapp.app.Component.memberUpdated = function() {
    //check for change of parent
    if(this.object.getParent() !== this.uiActiveParent) {
        var oldParent = this.uiActiveParent;
        var newParent = this.object.getParent();
       
        this.uiActiveParent = newParent;
        
        //remove from old parent component
        if(oldParent) {
            var oldParentComponent = this.workspaceUI.getComponent(oldParent);
            oldParentComponent.removeChildComponent(this);
            //delete all the old windows
            for(var i = 0; i < this.windowDisplays.length; i++) {
                this.windowDisplays[i].deleteWindow();
            }
            this.windowDisplays = [];
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
        
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_ERROR;
        bannerMessage = errorMsg;
    }
    else if(object.getResultPending()) {
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_PENDING;
        bannerMessage = haxapp.app.WindowHeaderManager.PENDING_MESSAGE;
        
    }
    else {   
        bannerState = haxapp.app.WindowHeaderManager.BANNER_TYPE_NONE;
        bannerMessage = null;
    }
    
    //update for new data
    this.treeDisplay.updateData();
    this.treeDisplay.setBannerState(bannerState,bannerMessage);
    if(this.windowDisplay != null) {
        this.windowDisplay.updateData();
        this.windowDisplay.setBannerState(bannerState,bannerMessage);
    }
}

/** This method is used for setting initial values in the property dialog. 
 * If there are additional property lines, in the generator, this method should
 * be extended to give the values of those properties too. */
haxapp.app.Component.getPropertyValues = function() {
    
    var member = this.object;
    var generator = member.generator;
    
    var values = {};
    values.name = member.getName();
    values.parentName = member.getParent().getFullName();
    
    if(generator.addPropFunction) {
        generator.addPropFunction(member,values);
    }
    return values;
}

///** This method shoudl be implemented by an extending class to create a component
// * display, given a container, for the component. */
//haxapp.app.Component.prototype.createDisplayContent = function(container);

//=============================
// Action UI Entry Points
//=============================

/** This method creates a callback for deleting the component. 
 *  @private */
haxapp.app.Component.createDeleteCallback = function() {
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
        var actionResponse = hax.action.doAction(object.getWorkspace(),json);

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
//haxapp.app.JsonTableComponent.generator = {};
//haxapp.app.JsonTableComponent.generator.displayName = "JSON Table";
//haxapp.app.JsonTableComponent.generator.uniqueName = "haxapp.app.JsonTableComponent";
//haxapp.app.JsonTableComponent.generator.createComponent = haxapp.app.JsonTableComponent.createComponent;
//haxapp.app.JsonTableComponent.generator.createComponentFromJson = haxapp.app.JsonTableComponent.createComponentFromJson;
//haxapp.app.JsonTableComponent.generator.DEFAULT_WIDTH = 200;
//haxapp.app.JsonTableComponent.generator.DEFAULT_HEIGHT = 200;