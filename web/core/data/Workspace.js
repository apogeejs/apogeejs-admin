/** This is the workspace. */
hax.core.Workspace = function(nameOrJson,actionResponseForJson) {
    //base init
    hax.core.EventManager.init.call(this);
    hax.core.ContextHolder.init.call(this);
    hax.core.Owner.init.call(this);
    
    var inputArgType = hax.core.util.getObjectType(nameOrJson);
    
    if(inputArgType === "String") {
        this.name = nameOrJson;
        this.rootFolder = new hax.core.Folder(nameOrJson,this);
    }
    else {
        this.loadFromJson(nameOrJson,actionResponseForJson);
    }
}

//add components to this class
hax.core.util.mixin(hax.core.Workspace,hax.core.EventManager);
hax.core.util.mixin(hax.core.Workspace,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.Workspace,hax.core.Owner);

/** this method gets the workspace name. */
hax.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the root package for the workspace. */
hax.core.Workspace.prototype.getRootFolder = function() {
    return this.rootFolder;
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being added. */
hax.core.Workspace.prototype.updateForAddedVariable = function(object,recalculateList) {
    this.rootFolder.updateForAddedVariable(object,recalculateList);
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being deleted. */
hax.core.Workspace.prototype.updateForDeletedVariable = function(object,recalculateList) {
    this.rootFolder.updateForDeletedVariable(object,recalculateList);
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being moved. */
hax.core.Workspace.prototype.updateForMovetedVariable = function(object,recalculateList) {
    this.rootFolder.updateForAddedVariable(object,recalculateList);
    this.rootFolder.updateForDeletedVariable(object,recalculateList);
}

/** This method removes any data from this workspace on closing. */
hax.core.Workspace.prototype.close = function() {
}

//------------------------------
// Owner Methods
//------------------------------

/** this method is implemented for the Owner component/mixin. */
hax.core.Workspace.prototype.getWorkspace = function() {
   return this;
}

/** this method gets the hame the children inherit for the full name. */
hax.core.Workspace.prototype.getPossesionNameBase = function() {
    return this.name + ":";
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.core.Workspace.prototype.createContextManager = function() {
    //set the context manager
    var contextManager = new hax.core.ContextManager(null);
    //global variables from window object
    var globalVarEntry = {};
    globalVarEntry.isLocal = false;
    globalVarEntry.data = window;
    contextManager.addToContextList(globalVarEntry);
    
    return contextManager;
}


//==========================
//virtual workspace methods
//==========================

/** This method makes a virtual workspace that contains a copy of the give folder
 * as the root folder. Optionally the context manager may be set. */
hax.core.Workspace.createVirtualWorkpaceFromFolder = function(name,origRootFolder,optionalContextManager) {
	//create a workspace json from the root folder json
	var workspaceJson = {};
    workspaceJson.name = name;
    workspaceJson.fileType = hax.core.Workspace.SAVE_FILE_TYPE;
    workspaceJson.version = hax.core.Workspace.SAVE_FILE_VERSION;
    workspaceJson.data = origRootFolder.toJson();
	
	if(optionalContextManager !== undefined) {
		workspaceJson.contextManager = optionalContextManager;
	}
	
    return new hax.core.Workspace(workspaceJson);
}

//============================
// Save Functions
//============================

/** This is the supported file type. */
hax.core.Workspace.SAVE_FILE_TYPE = "hax workspace";

/** This is the supported file version. */
hax.core.Workspace.SAVE_FILE_VERSION = 0.1;

hax.core.Workspace.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.fileType = hax.core.Workspace.SAVE_FILE_TYPE;
    json.version = hax.core.Workspace.SAVE_FILE_VERSION;
    
    //components
    json.data = this.rootFolder.toJson();
    
    return json;
}


/** This is loads data from the given json into this workspace. 
 * @private */
hax.core.Workspace.prototype.loadFromJson = function(json,actionResponse) {
    var fileType = json.fileType;
	if(fileType !== hax.core.Workspace.SAVE_FILE_TYPE) {
		throw hax.core.util.createError("Bad file format.",false);
	}
    if(json.version !== hax.core.Workspace.SAVE_FILE_VERSION) {
        throw hax.core.util.createError("Incorrect file version.",false);
    }
    
    this.name = json.name;
	
	//load context links
	if(json.contextManager) {
		//for now just include this one. Later we need to have some options
		//for saving and opening
		//THIS IS ONLY FOR THE WORKSHEET IMPLEMENTATION FOR NOW!
		this.setContextManager(json.contextManager);
	}
	
	//recreate the root folder
	var updateDataList = [];
    this.rootFolder = hax.core.Folder.fromJson(this,json.data,updateDataList);
    
    //set the data on all the objects
    if(updateDataList.length > 0) {
        actionResponse = hax.core.updatemember.updateObjects(updateDataList,actionResponse);
    }
}

//================================
// Member generator functions
//================================

hax.core.Workspace.memberGenerators = {};

/** This methods retrieves the member generator for the given type. */
hax.core.Workspace.getMemberGenerator = function(type) {
    return hax.core.Workspace.memberGenerators[type];
}

/** This method registers the member generator for a given named type. */
hax.core.Workspace.addMemberGenerator = function(generator) {
    hax.core.Workspace.memberGenerators[generator.type] = generator;
}