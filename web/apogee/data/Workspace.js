/** This is the workspace. Typically owner should be null. It
 * is used for creating virtual workspaces. */
apogee.Workspace = function(optionalJson,actionResponseForJson,ownerForVirtualWorkspace) {
    //base init
    apogee.EventManager.init.call(this);
    apogee.ContextHolder.init.call(this);
    apogee.Owner.init.call(this);
    apogee.RootHolder.init.call(this);
    
    // This is a queue to hold actions while one is in process.
    this.isDirty = false;
    this.actionInProgress = false;
    this.actionQueue = [];
    this.name = apogee.Workspace.DEFAULT_WORKSPACE_NAME;
    
    if(ownerForVirtualWorkspace === undefined) ownerForVirtualWorkspace = null;
    this.owner = ownerForVirtualWorkspace;
    
    if(!optionalJson) {
        this.rootFolder = new apogee.Folder(apogee.Workspace.ROOT_FOLDER_NAME,this);
    }
    else {
        this.loadFromJson(optionalJson,actionResponseForJson);
    }
}

//add components to this class
apogee.base.mixin(apogee.Workspace,apogee.EventManager);
apogee.base.mixin(apogee.Workspace,apogee.ContextHolder);
apogee.base.mixin(apogee.Workspace,apogee.Owner);
apogee.base.mixin(apogee.Workspace,apogee.RootHolder);


apogee.Workspace.DEFAULT_WORKSPACE_NAME = "Workspace";
apogee.Workspace.ROOT_FOLDER_NAME = "Model";

/** this method should be used to set the workspace as dirty, meaning it has 
 * new data to be saved. */
apogee.Workspace.prototype.setIsDirty = function() {
    this.isDirty = true;
}

/** This method returns true if the workspace needs to be saved. */
apogee.Workspace.prototype.getIsDirty = function() {
    return this.isDirty;
}

/** This method clears the is dirty flag. */
apogee.Workspace.prototype.clearIsDirty = function() {
    this.isDirty = false;
}

/** This method returns the root object - implemented from RootHolder.  */
apogee.Workspace.prototype.setName = function(name) {
    this.name = name;
}

/** This method returns the root object - implemented from RootHolder.  */
apogee.Workspace.prototype.getName = function() {
    return this.name;
}

/** This method returns the root object - implemented from RootHolder.  */
apogee.Workspace.prototype.getRoot = function() {
    return this.rootFolder;
}

/** This method sets the root object - implemented from RootHolder.  */
apogee.Workspace.prototype.setRoot = function(member) {
    this.rootFolder = member;
}

/** This allows for a workspace to have a parent. For a normal workspace this should be null. 
 * This is used for finding variables in scope. */
apogee.Workspace.prototype.getOwner = function() {
    return this.owner;
}

/** This method updates the dependencies of any children in the workspace. */
apogee.Workspace.prototype.updateDependeciesForModelChange = function(recalculateList) {
    if(this.rootFolder) {
        this.rootFolder.updateDependeciesForModelChange(recalculateList);
    }
}

/** This method removes any data from this workspace on closing. */
apogee.Workspace.prototype.onClose = function() {
    this.rootFolder.onClose();
}

/** This function triggers the action for the queued action to be run when the current thread exits. */
apogee.Workspace.prototype.isActionInProgress = function() {
    return this.actionInProgress;
}

apogee.Workspace.prototype.setActionInProgress = function(inProgress) {
    this.actionInProgress = inProgress;
}

apogee.Workspace.prototype.queueAction = function(actionInfo) {
    this.actionQueue.push(actionInfo);
}

apogee.Workspace.prototype.getQueuedAction = function() {
    if(this.actionQueue.length > 0) {
        var queuedActionInfo = this.actionQueue[0];
        this.actionQueue.splice(0,1)
        return queuedActionInfo;
    }
    else {
        return null;
    }
}


//------------------------------
// Owner Methods
//------------------------------

/** this method is implemented for the Owner component/mixin. */
apogee.Workspace.prototype.getWorkspace = function() {
   return this;
}

/** this method gets the hame the children inherit for the full name. */
apogee.Workspace.prototype.getPossesionNameBase = function() {
    //the name starts over at a new workspace
    return "";
}

/** This method looks up a member by its full name. */
apogee.Workspace.prototype.getMemberByPathArray = function(path,startElement) {
    if(startElement === undefined) startElement = 0;
    if(path[startElement] === this.rootFolder.getName()) {
        if(startElement === path.length-1) {
            return this.rootFolder;
        }
        else {
            startElement++;
            return this.rootFolder.lookupChildFromPathArray(path,startElement);
        }
    }
    else {
        return null;
    }
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
apogee.Workspace.prototype.createContextManager = function() {
    //set the context manager
    var contextManager = new apogee.ContextManager(this);
    
    if(this.owner) {
        //get the context of the owner, but flattened so we don't reference
        //the owner's tables
        apogee.Workspace.flattenParentIntoContextManager(contextManager,this.owner);
    }
    else {
        //global variables from window object
        var globalVarEntry = {};
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
apogee.Workspace.createVirtualWorkpaceFromFolder = function(name,origRootFolder,ownerInWorkspace) {
	//create a workspace json from the root folder json
	var workspaceJson = {};
    workspaceJson.fileType = apogee.Workspace.SAVE_FILE_TYPE;
    workspaceJson.version = apogee.Workspace.SAVE_FILE_VERSION;
    workspaceJson.data = origRootFolder.toJson();
	
    var virtualWorkspace = new apogee.Workspace(workspaceJson,null,ownerInWorkspace);
    
    return virtualWorkspace;
}

//this is a cludge. look into fixing it.
apogee.Workspace.flattenParentIntoContextManager = function(contextManager,virtualWorkspaceParent) {
    for(var owner = virtualWorkspaceParent; owner != null; owner = owner.getOwner()) {
        var ownerContextManager = owner.getContextManager();
        var contextList = ownerContextManager.contextList; //IF WE USE THIS WE NEED TO MAKE IT ACCESSIBLE!
        for(var i = 0; i < contextList.length; i++) {
            var contextEntry = contextList[i];
            //only take non-local entries
            if(contextEntry.parent) {
                //add this entry after converting it to a data entry, 
                contextManager.addToContextList(apogee.Workspace.convertToDataContextEntry(contextEntry));
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

apogee.Workspace.convertToDataContextEntry = function(contextEntry) {
    var contextDataEntry = {};
    contextDataEntry.data = contextEntry.parent.getData();
    return contextDataEntry;
}
    
//============================
// Save Functions
//============================

/** This is the supported file type. */
apogee.Workspace.SAVE_FILE_TYPE = "apogee workspace";

/** This is the supported file version. */
apogee.Workspace.SAVE_FILE_VERSION = 0.2;

/** This saves the workspace. It the optionalSavedRootFolder is passed in,
 * it will save a workspace with that as the root folder. */
apogee.Workspace.prototype.toJson = function(optionalSavedRootFolder) {
    var json = {};
    json.fileType = apogee.Workspace.SAVE_FILE_TYPE;
    json.version = apogee.Workspace.SAVE_FILE_VERSION;
    
    json.name = this.name;
    
    var rootFolder;
    if(optionalSavedRootFolder) {
        rootFolder = optionalSavedRootFolder;
    }
    else {
        rootFolder = this.rootFolder;
    }
    
    //components
    json.data = rootFolder.toJson();
    
    return json;
}


/** This is loads data from the given json into this workspace. 
 * @private */
apogee.Workspace.prototype.loadFromJson = function(json,actionResponse) {
    var fileType = json.fileType;
	if(fileType !== apogee.Workspace.SAVE_FILE_TYPE) {
		throw apogee.base.createError("Bad file format.",false);
	}
    if(json.version !== apogee.Workspace.SAVE_FILE_VERSION) {
        throw apogee.base.createError("Incorrect file version. CHECK APOGEEJS.COM FOR VERSION CONVERTER.",false);
    }
	
    if(!actionResponse) actionResponse = new apogee.ActionResponse();
    
    if(json.name !== undefined) {
        this.name = json.name;
    }

    var actionData = json.data;
    actionData.action = "createMember";
    actionData.owner = this;
    actionData.workspace = this;
    apogee.action.doAction(actionData,false,actionResponse);
    
    return actionResponse;
}

//================================
// Member generator functions
//================================

apogee.Workspace.memberGenerators = {};

/** This methods retrieves the member generator for the given type. */
apogee.Workspace.getMemberGenerator = function(type) {
    return apogee.Workspace.memberGenerators[type];
}

/** This method registers the member generator for a given named type. */
apogee.Workspace.addMemberGenerator = function(generator) {
    apogee.Workspace.memberGenerators[generator.type] = generator;
}