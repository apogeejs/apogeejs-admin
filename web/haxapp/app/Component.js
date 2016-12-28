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
    this.activeParent = object.getParent();
    this.generator = generator;
    
    this.parentContainer = this.workspaceUI.getParentContainerObject(object);
    if(!this.parentContainer) {
        throw hax.base.createError("Parent object not found: " + object.getFullName());
    }
    
    this.workspaceUI.registerMember(this.object,this);
    
    //inheriting objects can pass functions here to be called on cleanup, save, etc
    this.saveActions = [];
    this.cleanupActions = [];
    
    //--------------
    //create window
    //--------------
    var windowOptions = {};
    windowOptions.minimizable = true;
    windowOptions.maximizable = true;
    windowOptions.resizable = true;
    windowOptions.movable = true;
    windowOptions.frameColorClass = "visicomp_windowColor";
    windowOptions.titleBarClass = "visicomp_titleBarClass";
    this.window = new haxapp.ui.WindowFrame(this.parentContainer,windowOptions);

    //------------------
    // Add menu (we will add the items later. This populates it.)
    //------------------

    var menu = this.window.getMenu();
    
    //------------------
    //set the title
    //------------------
    this.window.setTitle(this.getObject().getDisplayName());
    
    //headers
    this.toolbarDiv = null;
    this.toolbarActive = false;
    this.bannerDiv = null;
    this.bannerBarActive = false;
    
    //show the window
    if(options.coordInfo) {
        this.window.setCoordinateInfo(options.coordInfo);
    }
    else {
        //set position 
        var pos = this.parentContainer.getNextWindowPosition();
        this.window.setPosition(pos[0],pos[1]);
        
        //set default size
        this.window.setSize(generator.DEFAULT_WIDTH,generator.DEFAULT_HEIGHT);
    }
    if(options.windowState) {
        this.window.setWindowState(options.windowState);
    }
    this.window.show();
    
    
    //------------------
    // Add window content
    //------------------
    
    //menu items
    this.menuItemInfoList = [];
    
    //add the standard entries
    var itemInfo = {};
    itemInfo.title = "Edit Properties";
    itemInfo.callback = haxapp.app.updatecomponent.getUpdateComponentCallback(this,this.generator);
    this.menuItemInfoList.push(itemInfo);
    
    var itemInfo = {};
    itemInfo.title = "Delete";
    itemInfo.callback = this.createDeleteCallback(itemInfo.title);
    this.menuItemInfoList.push(itemInfo);
    
    //let the extending object populate the frame and the menu items
	if(this.populateFrame) {
		this.populateFrame();
	}
    
    //set the menu items
    menu.setMenuItems(this.menuItemInfoList);
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

//=======================
// Headers
//=======================

//constants for the window banner bar
haxapp.app.Component.BANNER_TYPE_ERROR = "error";
haxapp.app.Component.BANNER_BGCOLOR_ERROR = "red";
haxapp.app.Component.BANNER_FGCOLOR_ERROR = "white";

haxapp.app.Component.BANNER_TYPE_PENDING = "pending";
haxapp.app.Component.BANNER_BGCOLOR_PENDING = "yellow";
haxapp.app.Component.BANNER_FGCOLOR_PENDING = "black";

haxapp.app.Component.BANNER_BGCOLOR_UNKNOWN = "yellow";
haxapp.app.Component.BANNER_FGCOLOR_UNKNOWN = "black";

haxapp.app.Component.PENDING_MESSAGE = "Calculation pending...";

/** This method returns the base member for this component. */
haxapp.app.Component.showBannerBar = function(text,type) {
    
    if(!this.bannerDiv) {
        this.bannerDiv = haxapp.ui.createElement("div",null,
            {
                "display":"block",
                "position":"relative",
                "top":"0px",
                "backgroundColor":bgColor,
                "color":fgColor
            });
    }
    
    //get banner color
    var bgColor;
    var fgColor;
    if(type == haxapp.app.Component.BANNER_TYPE_ERROR) {
        bgColor = haxapp.app.Component.BANNER_BGCOLOR_ERROR;
        fgColor = haxapp.app.Component.BANNER_FGCOLOR_ERROR;
    }
    else if(type == haxapp.app.Component.BANNER_TYPE_PENDING) {
        bgColor = haxapp.app.Component.BANNER_BGCOLOR_PENDING;
        fgColor = haxapp.app.Component.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = haxapp.app.Component.BANNER_BGCOLOR_UNKNOWN;
        fgColor = haxapp.app.Component.BANNER_FGCOLOR_UNKNOWN;
   }
   var colorStyle = {};
   colorStyle.backgroundColor = bgColor;
   colorStyle.color = fgColor;
   haxapp.ui.applyStyle(this.bannerDiv,colorStyle);
       
    //set message
    this.bannerDiv.innerHTML = text;
    this.bannerBarActive = true;
	
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.Component.hideBannerBar = function() {
	this.bannerBarActive = false;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.Component.showToolbar = function(toolbarDiv) {
    this.toolbarActive = true;
    this.toolbarDiv = toolbarDiv;
	this.showActiveHeaders();
}

/** This method returns the base member for this component. */
haxapp.app.Component.hideToolbar = function() {
    this.toolbarActive = false;
    this.toolbarDiv = null;	
	this.showActiveHeaders();
}

/** This method shows the active headers. 
 * @private */
haxapp.app.Component.showActiveHeaders = function() {
	var window = this.getWindow();
	
	var headers = [];
    if((this.toolbarActive)&&(this.toolbarDiv)) {
		headers.push(this.toolbarDiv);
	}
    if((this.saveBarActive)&&(this.saveDiv)) {
		headers.push(this.saveDiv);
	}
	if((this.bannerBarActive)&&(this.bannerDiv)) {
		headers.push(this.bannerDiv);
	}
	
	
    window.loadHeaders(headers);
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

/** This method populates the frame for this component. */
haxapp.app.Component.getWindow = function() {
     return this.window;
}

/** This method sets the content element as a scrolling element. */
haxapp.app.Component.setScrollingContentElement = function() {
    //load the content div
    this.contentDiv = haxapp.ui.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
    this.window.setContent(this.contentDiv);
}

/** This method sets the content element as a fixed element. */
haxapp.app.Component.setFixedContentElement = function() {
    //load the content div
    this.contentDiv = this.window.getBody();
}

/** This method returns the content element for the windowframe for this component. */
haxapp.app.Component.getContentElement = function() {
     return this.contentDiv;
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
    //remove the UI element
    var componentWindow = this.getWindow();
    componentWindow.deleteWindow();
    
    //execute cleanup actions
    for(var i = 0; i < this.cleanupActions.length; i++) {
        this.cleanupActions[i].call(this);
    }
}

/** This method extends the member udpated function from the base.
 * @protected */    
haxapp.app.Component.memberUpdated = function() {
    //check for change of parent
    if(this.object.getParent() !== this.activeParent) {
        this.activeParent = this.object.getParent();
        this.parenContainer = this.getWorkspaceUI().getParentContainerObject(this.object);
        this.window.changeParent(this.parenContainer);
    }
    
    //update title
    this.updateTitle();
    
    //update data
    var object = this.getObject();
    if(object.hasError()) {
        var errorMsg = "";
        var actionErrors = object.getErrors();
        for(var i = 0; i < actionErrors.length; i++) {
            errorMsg += actionErrors[i].msg + "\n";
        }
        
        this.showBannerBar(errorMsg,haxapp.app.Component.BANNER_TYPE_ERROR);
    }
    else if(object.getResultPending()) {
        this.showBannerBar(haxapp.app.Component.PENDING_MESSAGE,haxapp.app.Component.BANNER_TYPE_PENDING);
    }
    else {   
        this.hideBannerBar();
    }
}

/** This method makes sure the window title is up to date.
 * @private */    
haxapp.app.Component.updateTitle = function() {
    //make sure the title is up to data
    var window = this.getWindow();
    if(window) {
        var member = this.getObject();
        var displayName = member.getDisplayName();
        var windowTitle = window.getTitle();
        if(windowTitle !== displayName) {
            window.setTitle(displayName);
        }
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