if(!hax.app) hax.app = {};
if(!hax.app.visiui) hax.app.visiui = {};
if(!hax.app.visiui.dialog) hax.app.visiui.dialog = {};

/** This is the main class of the hax application. */
hax.app.visiui.Hax = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    hax.core.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUIs = {};
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new hax.app.visiui.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI
	this.createUI(containerId);
    
    //open a workspace - from url or default
    var workspaceUrl = hax.core.util.readQueryField("url",document.URL);
    if(workspaceUrl) {
        hax.app.visiui.openworkspace.openWorkspaceFromUrl(this,workspaceUrl);
    }
    else {
        //create a default workspace 
        hax.app.visiui.createworkspace.createWorkspace(this,hax.app.visiui.Hax.DEFAULT_WORKSPACE_NAME);
    }
}
	
//add components to this class
hax.core.util.mixin(hax.app.visiui.Hax,hax.core.EventManager);

hax.app.visiui.Hax.DEFAULT_WORKSPACE_NAME = "workspace";

hax.app.visiui.Hax.prototype.getWorkspace = function(name) {
    var workspaceUI = this.getWorkspaceUI(name);
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

hax.app.visiui.Hax.prototype.getWorkspaceUI = function(name) {
	return this.workspaceUIs[name];
}

hax.app.visiui.Hax.prototype.getActiveWorkspaceUI = function() {
    var name = this.tabFrame.getActiveTabTitle();
    if(name) {
        return this.workspaceUIs[name];
    }
    else {
        return null;
    }
}

hax.app.visiui.Hax.prototype.getActiveWorkspace = function() {
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
hax.app.visiui.Hax.prototype.addWorkspaceUI = function(workspaceUI,name) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUIs[name]) {
        throw hax.core.util.createError("There is already an open workspace with the name " + name,false);
    }
    
	var tab = this.tabFrame.addTab(name);
    this.tabFrame.setActiveTab(name);
    workspaceUI.setApp(this,tab);
    this.workspaceUIs[name] = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
hax.app.visiui.Hax.prototype.removeWorkspaceUI = function(name) {
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
hax.app.visiui.Hax.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(workspaceName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
hax.app.visiui.Hax.prototype.registerComponent = function(componentGenerator) {
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
hax.app.visiui.Hax.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
hax.app.visiui.Hax.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(hax.app.visiui.JsonTableComponent.generator);
    this.registerStandardComponent(hax.app.visiui.GridTableComponent.generator);
	this.registerStandardComponent(hax.app.visiui.FolderComponent.generator);
	this.registerStandardComponent(hax.app.visiui.FunctionComponent.generator);
    this.registerStandardComponent(hax.app.visiui.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(hax.app.visiui.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
hax.app.visiui.Hax.prototype.registerStandardComponent = function(componentGenerator) {
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
hax.app.visiui.Hax.prototype.createUI = function(containerId) {
    
    var windowElements = hax.visiui.initWindows(containerId);
    var topContainer = windowElements.baseElement;
    
    var container = document.createElement("div");
    var containerStyle = {
        "position":"relative",
        "display":"table",
        "width":"100%",
        "height":"100%"
    };
    hax.visiui.applyStyle(container,containerStyle);
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
    hax.visiui.applyStyle(tabFrameDiv,tabFrameDivStyle);
    container.appendChild(tabFrameDiv);
    
    var options = {};
    options.tabBarColorClass = "visicomp_tabFrameColor";
    options.activeTabColorClass = "visicomp_tabFrameActiveColor";
    this.tabFrame = new hax.visiui.TabFrame(tabFrameDiv,options);
    
}

//=================================
// Menu Functions
//=================================

hax.app.visiui.Hax.prototype.populateAddChildMenu = function(menu,optionalInitialValues,optionalComponentOptions) {
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        var title = "Add " + generator.displayName;
        var callback = hax.app.visiui.updatecomponent.getAddComponentCallback(this,generator,optionalInitialValues,optionalComponentOptions);
        menu.addCallbackMenuItem(title,callback);
    }

    //add the additional component item
    var componentCallback = hax.app.visiui.addadditionalcomponent.getAddAdditionalComponentCallback(this,optionalInitialValues,optionalComponentOptions);
    menu.addCallbackMenuItem("Other Components...",componentCallback);
}

/** This loads the context menu for the key. It should be update if
 *the key index changes. */
hax.app.visiui.Hax.prototype.setFolderContextMenu = function(contentElement,folder) {
    
    var app = this;

    var initialValues = {};
    initialValues.parentKey = hax.app.visiui.WorkspaceUI.getObjectKey(folder);
    
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
        
        var contextMenu = new hax.visiui.MenuBody();
        app.populateAddChildMenu(contextMenu,initialValues,componentOptions);
        
        hax.visiui.Menu.showContextMenu(contextMenu,event);
    }
}

