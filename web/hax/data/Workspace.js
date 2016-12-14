/** This is the workspace. Typically owner should be null. It
 * is used for creating virtual workspaces. */
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
        this.rootFolder = new hax.Folder(hax.Parent.ROOT_NAME,this);
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
    if(this.owner) {
        return this.owner.getPossesionNameBase() + this.name + ".";
    }
    else {
        return "";
    }
}

/** This method looks up a member by its full name. */
hax.Workspace.prototype.getMemberByPathArray = function(path,startElement) {
    if(startElement === undefined) startElement = 0;
    if(path[startElement] === hax.Parent.ROOT_NAME) return this.rootFolder;
    return this.rootFolder.lookupChildFromPathArray(path,startElement);
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.Workspace.prototype.createContextManager = function() {
    //set the context manager
    var contextManager = new hax.ContextManager(this);
    
    if(this.owner) {
        //get the context of the owner, but flattened so we don't reference
        //the owner's tables
        hax.Workspace.flattenParentIntoContextManager(contextManager,this.owner);
    }
    else {
        //global variables from window object
        var globalVarEntry = {};
        globalVarEntry.isLocal = false;
        globalVarEntry.data = __globals__;
        contextManager.addToContextList(globalVarEntry);
    }
    
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
	
    var virtualWorkspace = new hax.Workspace(workspaceJson,null,ownerInWorkspace);
    
    return virtualWorkspace;
}

//this is a cludge. look into fixing it.
hax.Workspace.flattenParentIntoContextManager = function(contextManager,virtualWorkspaceParent) {
    for(var owner = virtualWorkspaceParent; owner != null; owner = owner.getOwner()) {
        var ownerContextManager = owner.getContextManager();
        var contextList = ownerContextManager.contextList; //IF WE USE THIS WE NEED TO MAKE IT ACCESSIBLE!
        for(var i = 0; i < contextList.length; i++) {
            var contextEntry = contextList[i];
            //only take non-local entries
            if(contextEntry.isLocal) continue;
//=============================================================
//for now - this is what we would do if we took the folder functino parent. Currently the regular code does not do this.
//            //only take local entries if this is owner is the local owner 
//            if((contextEntry.isLocal)&&(owner != virtualWorkspaceParent)) {
//                continue;
//            }
//==============================================================
            
            if(contextEntry.parent) {
                //add this entry after converting it to a data entry, 
                contextManager.addToContextList(hax.Workspace.convertToDataContextEntry(contextEntry));
            }
            else if(contextEntry.data) {
                //already a data entry - add it directly
                contextManager.addToContextList(contextEntry);
            }
            else {
                //unknown case - ignore
            }
        }
    }
}

hax.Workspace.convertToDataContextEntry = function(contextEntry) {
    var contextDataEntry = {};
    contextDataEntry.isLocal = false;
    if(contextEntry.parent.isDataHolder) {
        contextDataEntry.data = contextEntry.parent.getData();
    }
    return contextDataEntry;
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

    var actionData = json.data;
    actionData.action = "createMember";
    actionData.owner = this;
    hax.action.doAction(this,actionData,actionResponse);
    
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