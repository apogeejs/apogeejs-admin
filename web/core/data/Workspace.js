/** This is the workspace. Typically owner should be null. */
hax.core.Workspace = function(nameOrJson,actionResponseForJson,owner) {
    //base init
    hax.core.EventManager.init.call(this);
    hax.core.ContextHolder.init.call(this);
    hax.core.Owner.init.call(this);
    hax.core.RootHolder.init.call(this);
    
    if(owner === undefined) owner = null;
    this.owner = owner;
    
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
hax.core.util.mixin(hax.core.Workspace,hax.core.RootHolder);

/** this method gets the workspace name. */
hax.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the root package for the workspace. */
hax.core.Workspace.prototype.getRootFolder = function() {
    return this.rootFolder;
}

/** This method sets the root object - implemented from RootHolder.  */
hax.core.Workspace.prototype.setRoot = function(child) {
    this.rootFolder = child;
}

/** This allows for a workspace to have a parent. For a normal workspace this should be null. 
 * This is used for finding variables in scope. */
hax.core.Workspace.prototype.getOwner = function() {
    return this.owner;
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being added. */
hax.core.Workspace.prototype.updateForAddedVariable = function(object,recalculateList) {
    if(this.rootFolder) {
        this.rootFolder.updateForAddedVariable(object,recalculateList);
    }
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
    var contextManager = new hax.core.ContextManager(this);
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
hax.core.Workspace.createVirtualWorkpaceFromFolder = function(name,origRootFolder,ownerInWorkspace) {
	//create a workspace json from the root folder json
	var workspaceJson = {};
    workspaceJson.name = name;
    workspaceJson.fileType = hax.core.Workspace.SAVE_FILE_TYPE;
    workspaceJson.version = hax.core.Workspace.SAVE_FILE_VERSION;
    workspaceJson.data = origRootFolder.toJson();
	
    return new hax.core.Workspace(workspaceJson,null,ownerInWorkspace);
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
	
	//recreate the root folder and its children
    //this.rootFolder = hax.core.createmember.createMember(this,json.data,actionResponse);
    //DOH! This currently doesn't because create member assumes the root folder is set. 
    //maybe we should update so setting the owner on the root folder sets the root folder,
    //such as if the alternative to a parent is a "rootholder" or something like that.
    //for now I will jsut copy everything in create member
    
    if(!actionResponse) actionResponse = new hax.core.ActionResponse();

    hax.core.createmember.createMember(this,json.data,actionResponse);
    
    return actionResponse;
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