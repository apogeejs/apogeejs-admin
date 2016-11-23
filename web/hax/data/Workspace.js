/** This is the workspace. Typically owner should be null. */
hax.Workspace = function(nameOrJson,actionResponseForJson,owner) {
    //base init
    hax.EventManager.init.call(this);
    hax.ContextHolder.init.call(this);
    hax.Owner.init.call(this);
    hax.RootHolder.init.call(this);
    
    if(owner === undefined) owner = null;
    this.owner = owner;
    
    var inputArgType = hax.util.getObjectType(nameOrJson);
    
    if(inputArgType === "String") {
        this.name = nameOrJson;
        this.rootFolder = new hax.Folder(nameOrJson,this);
    }
    else {
        this.loadFromJson(nameOrJson,actionResponseForJson);
    }
}

//add components to this class
hax.base.mixin(hax.Workspace,hax.EventManager);
hax.base.mixin(hax.Workspace,hax.ContextHolder);
hax.base.mixin(hax.Workspace,hax.Owner);
hax.base.mixin(hax.Workspace,hax.RootHolder);

/** this method gets the workspace name. */
hax.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the root package for the workspace. */
hax.Workspace.prototype.getRoot = function() {
    return this.rootFolder;
}

/** This method sets the root object - implemented from RootHolder.  */
hax.Workspace.prototype.setRoot = function(child) {
    this.rootFolder = child;
}

/** This allows for a workspace to have a parent. For a normal workspace this should be null. 
 * This is used for finding variables in scope. */
hax.Workspace.prototype.getOwner = function() {
    return this.owner;
}

/** This method updates the dependencies of any children in the workspace. */
hax.Workspace.prototype.updateDependeciesForModelChange = function(recalculateList) {
    if(this.rootFolder) {
        this.rootFolder.updateDependeciesForModelChange(recalculateList);
    }
}

/** This method removes any data from this workspace on closing. */
hax.Workspace.prototype.close = function() {
}

//------------------------------
// Owner Methods
//------------------------------

/** this method is implemented for the Owner component/mixin. */
hax.Workspace.prototype.getWorkspace = function() {
   return this;
}

/** this method gets the hame the children inherit for the full name. */
hax.Workspace.prototype.getPossesionNameBase = function() {
    return this.name + ":";
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.Workspace.prototype.createContextManager = function() {
    //set the context manager
    var contextManager = new hax.ContextManager(this);
    //global variables from window object
    var globalVarEntry = {};
    globalVarEntry.isLocal = false;
    globalVarEntry.data = __globals__;
    contextManager.addToContextList(globalVarEntry);
    
    return contextManager;
}


//==========================
//virtual workspace methods
//==========================

/** This method makes a virtual workspace that contains a copy of the give folder
 * as the root folder. Optionally the context manager may be set. */
hax.Workspace.createVirtualWorkpaceFromFolder = function(name,origRootFolder,ownerInWorkspace) {
	//create a workspace json from the root folder json
	var workspaceJson = {};
    workspaceJson.name = name;
    workspaceJson.fileType = hax.Workspace.SAVE_FILE_TYPE;
    workspaceJson.version = hax.Workspace.SAVE_FILE_VERSION;
    workspaceJson.data = origRootFolder.toJson();
	
    return new hax.Workspace(workspaceJson,null,ownerInWorkspace);
}

//============================
// Save Functions
//============================

/** This is the supported file type. */
hax.Workspace.SAVE_FILE_TYPE = "hax workspace";

/** This is the supported file version. */
hax.Workspace.SAVE_FILE_VERSION = 0.2;

hax.Workspace.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.fileType = hax.Workspace.SAVE_FILE_TYPE;
    json.version = hax.Workspace.SAVE_FILE_VERSION;
    
    //components
    json.data = this.rootFolder.toJson();
    
    return json;
}


/** This is loads data from the given json into this workspace. 
 * @private */
hax.Workspace.prototype.loadFromJson = function(json,actionResponse) {
    var fileType = json.fileType;
	if(fileType !== hax.Workspace.SAVE_FILE_TYPE) {
		throw hax.base.createError("Bad file format.",false);
	}
    if(json.version !== hax.Workspace.SAVE_FILE_VERSION) {
        throw hax.base.createError("Incorrect file version. CHECK HAXAPP.COM FOR VERSION CONVERTER.",false);
    }
    
    this.name = json.name;
	
    if(!actionResponse) actionResponse = new hax.ActionResponse();

    hax.createmember.createMember(this,json.data,actionResponse);
    
    return actionResponse;
}

//================================
// Member generator functions
//================================

hax.Workspace.memberGenerators = {};

/** This methods retrieves the member generator for the given type. */
hax.Workspace.getMemberGenerator = function(type) {
    return hax.Workspace.memberGenerators[type];
}

/** This method registers the member generator for a given named type. */
hax.Workspace.addMemberGenerator = function(generator) {
    hax.Workspace.memberGenerators[generator.type] = generator;
}