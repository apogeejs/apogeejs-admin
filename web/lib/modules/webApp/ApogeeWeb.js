
apogeeapp.app = {};
apogeeapp.app.dialog = {};

apogeeapp.webapp = {};

/** This is the main class of the apogee application. */
apogeeapp.webapp.ApogeeWeb = function() {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    apogee.EventManager.init.call(this);
    
    //workspaces
    this.workspaceUI = null;
    
    //component generators
    this.componentGenerators = {};
    this.standardComponents = [];
    //these are a list of names of components that go in the "added component" list
    this.additionalComponents = [];
	
	this.linkManager = new apogeeapp.app.LinkManager();
	
	//load the standard component generators
	this.loadComponentGenerators();
	
}
	
//add components to this class
apogee.base.mixin(apogeeapp.webapp.ApogeeWeb,apogee.EventManager);

apogeeapp.webapp.ApogeeWeb.DEFAULT_WORKSPACE_NAME = "workspace";

apogeeapp.webapp.ApogeeWeb.prototype.getWorkspaceUI = function() {
	return this.workspaceUI;
}

apogeeapp.webapp.ApogeeWeb.prototype.getWorkspace = function() {
	if(this.workspaceUI) {
		return this.workspaceUI.getWorkspace();
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
apogeeapp.webapp.ApogeeWeb.prototype.setWorkspaceUI = function(workspaceUI) {
    
    //we can only have one workspace of a given name!
    if(this.workspaceUI) {
        throw apogee.base.createError("There is already an open workspace",false);
    }
    
    workspaceUI.setApp(this);
    this.workspaceUI = workspaceUI;
    return true;
}

/** This method closes the active workspace. */
apogeeapp.webapp.ApogeeWeb.prototype.clearWorkspaceUI = function() {
    //remove the workspace from the app
    this.workspaceUI = null;
    
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
apogeeapp.webapp.ApogeeWeb.prototype.updateWorkspaceLinks = function(ownerName,addList,removeList,linksLoadedCallback) {
	this.linkManager.updateWorkspaceLinks(ownerName,addList,removeList,linksLoadedCallback);
}

//=================================
// Component Management
//=================================

/** This method registers a component. */
apogeeapp.webapp.ApogeeWeb.prototype.registerComponent = function(componentGenerator) {
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
apogeeapp.webapp.ApogeeWeb.prototype.getComponentGenerator = function(name) {
	return this.componentGenerators[name];
}
//==========================
// App Initialization
//==========================

/** This method adds the standard components to the app. 
 * @private */
apogeeapp.webapp.ApogeeWeb.prototype.loadComponentGenerators = function() {
    //standard components
    this.registerStandardComponent(apogeeapp.app.JsonTableComponent.generator);
    this.registerStandardComponent(apogeeapp.app.GridTableComponent.generator);
    this.registerStandardComponent(apogeeapp.app.TextComponent.generator);
	this.registerStandardComponent(apogeeapp.app.FolderComponent.generator);
	this.registerStandardComponent(apogeeapp.app.FunctionComponent.generator);
    this.registerStandardComponent(apogeeapp.app.FolderFunctionComponent.generator);
	
    //additional components
    this.registerComponent(apogeeapp.app.CustomControlComponent.generator);
}

/** This method registers a component. 
 * @private */
apogeeapp.webapp.ApogeeWeb.prototype.registerStandardComponent = function(componentGenerator) {
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
