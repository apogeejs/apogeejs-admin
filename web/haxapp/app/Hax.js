haxapp.app = {};
haxapp.app.dialog = {};

/** This is the main class of the hax application. */
haxapp.app.Hax = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    hax.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUIs = {};
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new haxapp.app.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI
	this.createUI(containerId);
    
    //open a workspace - from url or default
    var workspaceUrl = hax.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        haxapp.app.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
    else {
        //create a default workspace 
        haxapp.app.createworkspace.createWorkspace(this,haxapp.app.Hax.DEFAULT_WORKSPACE_NAME);
    }
}
	
//add components to this class
hax.base.mixin(haxapp.app.Hax,hax.EventManager);

haxapp.app.Hax.DEFAULT_WORKSPACE_NAME = "workspace";

haxapp.app.Hax.prototype.getWorkspace = function(name) {
    var workspaceUI = this.getWorkspaceUI(name);
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

haxapp.app.Hax.prototype.getWorkspaceUI = function(name) {
	return this.workspaceUIs[name];
}

haxapp.app.Hax.prototype.getActiveWorkspaceUI = function() {
    var name = this.tabFrame.getActiveTabTitle();
    if(name) {
        return this.workspaceUIs[name];
    }
    else {
        return null;
    }
}

haxapp.app.Hax.prototype.getActiveWorkspace = function() {
    var workspaceUI = this.getActiveWorkspaceUI();
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

//==================================
// Workspace Management
//==================================

/** This method makes an empty workspace ui object. This throws an exception if
 * the workspace can not be opened.
 */
haxapp.app.Hax.prototype.addWorkspaceUI = function(workspaceUI,name) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUIs[name]) {
        throw hax.base.createError("There is already an open workspace with the name " + name,false);
    }
    
	var tab = this.tabFrame.addTab(name);
    this.tabFrame.setActiveTab(name);
    workspaceUI.setApp(this,tab);
    this.workspaceUIs[name] = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
haxapp.app.Hax.prototype.removeWorkspaceUI = function(name) {
    //remove the workspace from the app
    delete this.workspaceUIs[name];
    this.tabFrame.removeTab(name);
    return true;
}

//==================================
// Link Management
//==================================

/** This method adds links as registered by a given workspace. Links can be added and
 * removed. Removing links may or may not remove them from the page (currently
 * js links are not removed and css links are, once they are not used by any 
 * workspase. The linksLoadedCallback is optional. It is called when all links have
 * been loaded on the page.
 */
haxapp.app.Hax.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(workspaceName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
haxapp.app.Hax.prototype.registerComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered component with this name. Either the component has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    this.additionalComponents.push(name);
}

/** This method registers a component. */
haxapp.app.Hax.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
haxapp.app.Hax.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(haxapp.app.JsonTableComponent.generator);
    this.registerStandardComponent(haxapp.app.GridTableComponent.generator);
	this.registerStandardComponent(haxapp.app.FolderComponent.generator);
	this.registerStandardComponent(haxapp.app.FunctionComponent.generator);
    this.registerStandardComponent(haxapp.app.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(haxapp.app.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
haxapp.app.Hax.prototype.registerStandardComponent = function(componentGenerator) {
    var name = componentGenerator.uniqueName;
    if(this.componentGenerators[name]) {
//in the future we can maybe do something other than punt
        alert("There is already a registered component with this name. Either the component has already been added of the name is not unique.");
        return;
    }

//we should maybe warn if another component bundle is being overwritten 
    this.componentGenerators[name] = componentGenerator;
    this.standardComponents.push(name);
}

/** This method creates the app ui. 
 * @private */
haxapp.app.Hax.prototype.createUI = function(containerId) {
    
    var windowElements = haxapp.ui.initWindows(containerId);
    var topContainer = windowElements.baseElement;
    
    var container = document.createElement("div");
    var containerStyle = {
        "position":"relative",
        "display":"table",
        "width":"100%",
        "height":"100%"
    };
    haxapp.ui.applyStyle(container,containerStyle);
    topContainer.appendChild(container);
    
    //-------------------
    //create menus - note this functino is defined differently for web and electron, in a remote file
    //-------------------
    var menuBar = this.createMenuBar();
    container.appendChild(menuBar);

    //----------------------
    //create the tab frame - there is a tab for each workspace
    //--------------------------
    
    var tabFrameDiv = document.createElement("div");
    var tabFrameDivStyle = {
        "position":"relative",
        "backgroundColor":"white",
        "display":"table-row",
        "width":"100%",
        "height":"100%"
    }
    haxapp.ui.applyStyle(tabFrameDiv,tabFrameDivStyle);
    container.appendChild(tabFrameDiv);
    
    var options = {};
    options.tabBarColorClass = "visicomp_tabFrameColor";
    options.activeTabColorClass = "visicomp_tabFrameActiveColor";
    this.tabFrame = new haxapp.ui.TabFrame(tabFrameDiv,options);
    
}

//=================================
// Menu Functions
//=================================

/** This method creates the creates the menu bar, with the attached functionality. 
 * @private */
haxapp.app.Hax.prototype.createMenuBar = function() {
    
    //-------------------
    //create menus
    //-----------------------
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "position":"relative",
        "display":"table-row",
        "width":"100%",
        "padding":"2px"
    };
    haxapp.ui.applyStyle(menuBar,menuBarStyle);
    menuBar.className = "visicomp_menuBarStyle";
    
    //create the menus
    var menu;
    var name;
    var menus = {};

    //Workspace menu
    name = "Workspace";
    menu = haxapp.ui.Menu.createMenu(name);
    menuBar.appendChild(menu.getElement());
    menus[name] = menu;
    
    var newCallback = haxapp.app.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = haxapp.app.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = haxapp.app.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = haxapp.app.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    name = "Components";
    menu = haxapp.ui.Menu.createMenu(name);
    menuBar.appendChild(menu.getElement());
    menus[name] = menu;
    
    //add create child elements
    this.populateAddChildMenu(menu);
    
    //libraries menu
    name = "Libraries";
    menu = haxapp.ui.Menu.createMenu(name);
    menuBar.appendChild(menu.getElement());
    menus[name] = menu;
    
    var linksCallback = haxapp.app.updatelinks.getUpdateLinksCallback(this);
    menu.addCallbackMenuItem("Update Links",linksCallback);
    
    //allow the implementation to add more menus or menu items
    if(this.addToMenuBar) {
        this.addToMenuBar(menuBar,menus);
    }
    
    return menuBar;
    
}

///** This method should be implemented if custom menus or menu items are desired. */
//haxapp.app.Hax.prototype.addToMenuBar(menuBar,menus);


haxapp.app.Hax.prototype.populateAddChildMenu = function(menu,optionalInitialValues,optionalComponentOptions) {
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        var title = "Add " + generator.displayName;
        var callback = haxapp.app.addcomponent.getAddComponentCallback(this,generator,optionalInitialValues,optionalComponentOptions);
        menu.addCallbackMenuItem(title,callback);
    }

    //add the additional component item
    var componentCallback = haxapp.app.addcomponent.getAddAdditionalComponentCallback(this,optionalInitialValues,optionalComponentOptions);
    menu.addCallbackMenuItem("Other Components...",componentCallback);
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
haxapp.app.Hax.prototype.setFolderContextMenu = function(contentElement,folder) {
    
    var app = this;

    var initialValues = {};
    initialValues.parentKey = folder.getFullName();
    
    contentElement.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        //position the window if we can
        if(event.offsetX) {
            var componentOptions = {};
            var coordInfo = {};
            coordInfo.x = event.offsetX;
            coordInfo.y = event.offsetY;
            componentOptions.coordInfo = coordInfo;
        }
        
        var contextMenu = new haxapp.ui.MenuBody();
        app.populateAddChildMenu(contextMenu,initialValues,componentOptions);
        
        haxapp.ui.Menu.showContextMenu(contextMenu,event);
    }
}

