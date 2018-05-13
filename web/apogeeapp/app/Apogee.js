apogeeapp.app = {};
apogeeapp.app.dialog = {};

//======================================
//class definition
//======================================


/** This is the main class of the apogee application. 
 * This constuctor should not be called externally, the static creation method 
 * should be used. 
 * @private */
apogeeapp.app.Apogee = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    apogee.EventManager.init.call(this);
    
    if(apogeeapp.app.Apogee.instance != null) {
        throw new Error("Error: There is already an Apogee app instance - apogeeapp.app.Apogee is a singleton.");
    }
    else {
        apogeeapp.app.Apogee.instance = this;
    }
    
    //workspaces
    this.workspaceUI = null;
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI - if a container ID is passed in
    if(containerId !== undefined) {
        this.createUI(containerId);
    }
    
    //open a workspace if there is a url present
    var workspaceUrl = apogee.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        apogeeapp.app.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
}
	
//add components to this class
apogee.base.mixin(apogeeapp.app.Apogee,apogee.EventManager);

apogeeapp.app.Apogee.DEFAULT_WORKSPACE_NAME = "workspace";

//======================================
// static singleton methods
//======================================

/** @private */
apogeeapp.app.Apogee.instance = null;

/** This creates and returns an app instance. The app is a singleton. This call
 * should only be made once. The containerId is the DOM element ID in which the
 * app UI is created. If this is left as undefined the UI will not be created. This
 * is used when creating an alternate UI such as with the web app. */
apogeeapp.app.Apogee.createApp = function(containerId) {
    return new apogeeapp.app.Apogee(containerId);
}

/** This retrieves an existing instance. It does not create an instance. */
apogeeapp.app.Apogee.getInstance = function() {
    return apogeeapp.app.Apogee.instance;
}

//======================================
// public methods
//======================================

apogeeapp.app.Apogee.prototype.getWorkspaceUI = function() {
	return this.workspaceUI;
}

apogeeapp.app.Apogee.prototype.getWorkspace = function() {
	if(this.workspaceUI) {
		return this.workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

apogeeapp.app.Apogee.prototype.getWorkspaceIsDirty = function() {
    var workspace = this.getWorkspace();
    if(workspace) {
        return workspace.getIsDirty();
    }
    else {
        return false;
    }
}

apogeeapp.app.Apogee.prototype.clearWorkspaceIsDirty = function() {
    var workspace = this.getWorkspace();
    if(workspace) {
        workspace.clearIsDirty();
    }
}

//==================================
// Workspace Management
//==================================

/** This method makes an empty workspace ui object. This throws an exception if
 * the workspace can not be opened.
 */
apogeeapp.app.Apogee.prototype.setWorkspaceUI = function(workspaceUI) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUI) {
        throw apogee.base.createError("There is already an open workspace",false);
    }
    
    workspaceUI.setApp(this,this.tabFrame,this.treePane);
    this.workspaceUI = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
apogeeapp.app.Apogee.prototype.clearWorkspaceUI = function() {
    //remove the workspace from the app
    this.workspaceUI = null;
    
    return true;
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
apogeeapp.app.Apogee.prototype.registerComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
//just replace - but existing ones will not change!
//    if(this.componentGenerators[name]) {
//        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
//        if(!replace) return;
//    }

    this.componentGenerators[name] = componentGenerator;
    if(this.additionalComponents.indexOf(name) < 0) {
        this.additionalComponents.push(name);
    }
}

/** This method registers a component. */
apogeeapp.app.Apogee.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}

//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
apogeeapp.app.Apogee.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(apogeeapp.app.JsonTableComponent);
	this.registerStandardComponent(apogeeapp.app.FolderComponent);
	this.registerStandardComponent(apogeeapp.app.FunctionComponent);
    this.registerStandardComponent(apogeeapp.app.FolderFunctionComponent);
    this.registerStandardComponent(apogeeapp.app.DynamicForm);
    this.registerStandardComponent(apogeeapp.app.FormDataComponent);
	
    //additional components
    this.registerComponent(apogeeapp.app.CustomControlComponent);
    this.registerComponent(apogeeapp.app.JavascriptComponent);
    this.registerComponent(apogeeapp.app.GridTableComponent);
    this.registerComponent(apogeeapp.app.TextComponent);
}

/** This method registers a component. 
 * @private */
apogeeapp.app.Apogee.prototype.registerStandardComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
        var replace = confirm("There is already a registered component with this name. Would you like to continue?");
        if(!replace) return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    if(this.standardComponents.indexOf(name) < 0) {
        this.standardComponents.push(name);
    }
}

/** This method creates the app ui. 
 * @private */
apogeeapp.app.Apogee.prototype.createUI = function(containerId) {
    
    var windowElements = apogeeapp.ui.initWindows(containerId);
    var topContainer = windowElements.baseElement;
    
    var mainContainer = new apogeeapp.ui.DisplayAndHeader(apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null,
            apogeeapp.ui.DisplayAndHeader.FIXED_PANE,
            null
        );
    topContainer.appendChild(mainContainer.getOuterElement());
    
    //-------------------
    //create menus
    //-------------------
    var menuBar = this.createMenuBar();
    mainContainer.getHeader().appendChild(menuBar);
    
    //----------------------
    //create the split pane
    //----------------------
    var splitPane = new apogeeapp.ui.SplitPane(
            apogeeapp.ui.SplitPane.SCROLLING_PANE,
            apogeeapp.ui.SplitPane.FIXED_PANE
        );
    mainContainer.getBody().appendChild(splitPane.getOuterElement());

    //---------------------
    //load the tree pane
    //---------------------
    this.treePane = splitPane.getLeftPaneContainer();
    
    //----------------------
    //create the tab frame
    //----------------------
    this.tabFrame = new apogeeapp.ui.TabFrame();
    splitPane.getRightPaneContainer().appendChild(this.tabFrame.getElement());
    
    //add listener for displaying the active tab
    var instance = this;
    this.tabFrame.addListener(apogeeapp.ui.SHOWN_EVENT,function(tab){instance.onTabShown(tab);});
    this.tabFrame.addListener(apogeeapp.ui.HIDDEN_EVENT,function(tab){instance.onTabHidden(tab);});

}

/** This method creates the app ui. 
 * @private */
apogeeapp.app.Apogee.prototype.onTabHidden = function(tab) {
    this.activeTabIconDisplay.style.display = "none";
    this.activeTabTitleDisplay.style.display = "none";
}

apogeeapp.app.Apogee.prototype.onTabShown = function(tab) {
    if(!this.workspaceUI) return;
    
    var id = tab.getId();
    var component = this.workspaceUI.getComponentById(id);
    if(component) {
        this.activeTabIconDisplay.src = component.getIconUrl();
        this.activeTabTitleDisplay.innerHTML = component.getMember().getDisplayName(true);
        this.activeTabIconDisplay.style.display = "";
        this.activeTabTitleDisplay.style.display = "";
    }
}

//=================================
// Menu Functions
//=================================

/** This method creates the creates the menu bar, with the attached functionality. 
 * @private */
apogeeapp.app.Apogee.prototype.createMenuBar = function() {
    
    //-------------------
    //create menus
    //-----------------------
    
    //create the menus
    var menu;
    var name;
    var menus = {};
    
    //creat menu  bar with left elements (menus) and right elements (active tab display)
    var menuBar = apogeeapp.ui.createElementWithClass("div","menu_bar");
    var menuBarLeft = apogeeapp.ui.createElementWithClass("div","menu_bar_left",menuBar);
    var menuBarRight = apogeeapp.ui.createElementWithClass("div","menu_bar_right",menuBar);

    //Workspace menu
    name = "Workspace";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    var newCallback = apogeeapp.app.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = apogeeapp.app.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = apogeeapp.app.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = apogeeapp.app.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    name = "Components";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    //add create child elements
    menu.setMenuItems(this.getAddChildMenuItems());
    
    //libraries menu
    name = "Import/Export";
    menu = apogeeapp.ui.Menu.createMenu(name);
    menuBarLeft.appendChild(menu.getElement());
    menus[name] = menu;
    
    var importCallback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderComponent);
    menu.addCallbackMenuItem("Import as Folder",importCallback);
    
    var import2Callback = apogeeapp.app.importworkspace.getImportCallback(this,apogeeapp.app.FolderFunctionComponent);
    menu.addCallbackMenuItem("Import as Folder Function",import2Callback);
    
    var exportCallback = apogeeapp.app.exportworkspace.getExportCallback(this);
    menu.addCallbackMenuItem("Export as Workspace",exportCallback);
    
    //allow the implementation to add more menus or menu items
    if(this.addToMenuBar) {
        this.addToMenuBar(menuBar,menus);
    }
    
    //add the active tab display
    this.activeTabIconDisplay = apogeeapp.ui.createElementWithClass("img","tab-icon-display",menuBarRight);
    this.activeTabIconDisplay.style.display = "none";
    this.activeTabTitleDisplay = apogeeapp.ui.createElementWithClass("div","tab-title-display",menuBarRight);
    this.activeTabTitleDisplay.style.display = "none";
    return menuBar;
    
}

///** This method should be implemented if custom menus or menu items are desired. */
//apogeeapp.app.Apogee.prototype.addToMenuBar(menuBar,menus);

apogeeapp.app.Apogee.prototype.getAddChildMenuItems = function(optionalInitialValues,optionalComponentOptions) {
    
    var menuItemList = [];
    var menuItem;
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        
        menuItem = {};
        menuItem.title = "Add " + generator.displayName;
        menuItem.callback = apogeeapp.app.addcomponent.getAddComponentCallback(this,generator,optionalInitialValues,optionalComponentOptions);
        menuItemList.push(menuItem);
    }

    //add the additional component item
    menuItem = {};
    menuItem.title = "Other Components...";
    menuItem.callback = apogeeapp.app.addcomponent.getAddAdditionalComponentCallback(this,optionalInitialValues,optionalComponentOptions);
    menuItemList.push(menuItem);

    return menuItemList;
}

