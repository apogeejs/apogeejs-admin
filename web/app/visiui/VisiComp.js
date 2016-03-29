if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** This is the main class of the visicomp application. */
visicomp.app.visiui.VisiComp = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    visicomp.core.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUIs = {};
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new visicomp.app.visiui.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
	//create the UI
	this.createUI(containerId);
	
	//create a default workspace 
    visicomp.app.visiui.createworkspace.createWorkspace(this,visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME);
	
}
	
//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.VisiComp,visicomp.core.EventManager);

visicomp.app.visiui.VisiComp.DEFAULT_WORKSPACE_NAME = "workspace";

visicomp.app.visiui.VisiComp.prototype.getWorkspace = function(name) {
    var workspaceUI = this.getWorkspaceUI(name);
	if(workspaceUI) {
		return workspaceUI.getWorkspace();
	}
	else {
		return null;
	}
}

visicomp.app.visiui.VisiComp.prototype.getWorkspaceUI = function(name) {
	return this.workspaceUIs[name];
}

visicomp.app.visiui.VisiComp.prototype.getActiveWorkspaceUI = function() {
    var name = this.tabFrame.getActiveTabTitle();
    if(name) {
        return this.workspaceUIs[name];
    }
    else {
        return null;
    }
}

visicomp.app.visiui.VisiComp.prototype.getActiveWorkspace = function() {
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
visicomp.app.visiui.VisiComp.prototype.addWorkspaceUI = function(workspaceUI,name) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUIs[name]) {
        throw visicomp.core.util.createError("There is already an open workspace with the name " + name);
    }
    
	var tab = this.tabFrame.addTab(name);
    this.tabFrame.setActiveTab(name);
    workspaceUI.setApp(this,tab);
    this.workspaceUIs[name] = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
visicomp.app.visiui.VisiComp.prototype.removeWorkspaceUI = function(name) {
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
 * been loaded on the page. CALLBACK NOT CURRENTLY IMPLEMENTED!!!
 */
visicomp.app.visiui.VisiComp.prototype.updateWorkspaceLinks = function(workspaceName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(workspaceName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
visicomp.app.visiui.VisiComp.prototype.registerComponent = function(componentGenerator) {
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
visicomp.app.visiui.VisiComp.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(visicomp.app.visiui.JsonTableComponent.generator);
    this.registerStandardComponent(visicomp.app.visiui.GridTableComponent.generator);
	this.registerStandardComponent(visicomp.app.visiui.FolderComponent.generator);
	this.registerStandardComponent(visicomp.app.visiui.FunctionComponent.generator);
    this.registerStandardComponent(visicomp.app.visiui.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(visicomp.app.visiui.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
visicomp.app.visiui.VisiComp.prototype.registerStandardComponent = function(componentGenerator) {
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
visicomp.app.visiui.VisiComp.prototype.createUI = function(containerId) {
    
    var windowElements = visicomp.visiui.initWindows(containerId);
    var container = windowElements.baseElement;
    
    //-------------------
    //create menus
    //-----------------------
    var menuBar = document.createElement("div");
    var menuBarStyle = {
        "background-color":"rgb(217,229,250)",
        "padding":"2px"
    }
    visicomp.visiui.applyStyle(menuBar,menuBarStyle);
    container.appendChild(menuBar);
    
    //create the menus
    var menu;

    //Workspace menu
    menu = visicomp.visiui.Menu.createMenu("Workspace");
    menuBar.appendChild(menu.getElement());
    
    var newCallback = visicomp.app.visiui.createworkspace.getCreateCallback(this);
    menu.addCallbackMenuItem("New",newCallback);
    
    var openCallback = visicomp.app.visiui.openworkspace.getOpenCallback(this);
    menu.addCallbackMenuItem("Open",openCallback);
    
    var saveCallback = visicomp.app.visiui.saveworkspace.getSaveCallback(this);
    menu.addCallbackMenuItem("Save",saveCallback);
    
    var closeCallback = visicomp.app.visiui.closeworkspace.getCloseCallback(this);
    menu.addCallbackMenuItem("Close",closeCallback);	
	
    //Components Menu
    menu = visicomp.visiui.Menu.createMenu("Components");
    menuBar.appendChild(menu.getElement());
    
    for(var i = 0; i < this.standardComponents.length; i++) {
        var key = this.standardComponents[i];
        var generator = this.componentGenerators[key];
        var title = "Add " + generator.displayName;
        var callback = visicomp.app.visiui.addcomponent.getAddComponentCallback(this,generator);
        menu.addCallbackMenuItem(title,callback);
    }
    
    //add the additional component item
    var componentCallback = visicomp.app.visiui.addadditionalcomponent.getAddAdditionalComponentCallback(this,generator);
    menu.addCallbackMenuItem("Other Components...",componentCallback);
    
    //libraries menu
    menu = visicomp.visiui.Menu.createMenu("Libraries");
    menuBar.appendChild(menu.getElement());
    
    var linksCallback = visicomp.app.visiui.updatelinks.getUpdateLinksCallback(this);
    menu.addCallbackMenuItem("Update Links",linksCallback);

    //----------------------
    //create the tab frame - there is a tab for each workspace
    //--------------------------
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    container.appendChild(this.tabFrame.getElement());
    this.tabFrame.resizeElement();
    
}

//=================================
// Static Functions
//=================================

