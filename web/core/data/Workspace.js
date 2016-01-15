/** This is the workspace. */
visicomp.core.Workspace = function(name) {
    //base init
    visicomp.core.EventManager.init.call(this);
    visicomp.core.Owner.init.call(this);
    
    this.name = name;

    //add the root folder
	this.rootFolder = new visicomp.core.Folder(this,name);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.EventManager);
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.Owner);

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getType = function() {
    return "workspace";
}

/** this method gets the root packaage for the workspace. */
visicomp.core.Workspace.prototype.getRootFolder = function() {
    return this.rootFolder;
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being added. */
visicomp.core.Workspace.prototype.updateForAddedVariable = function(object) {
    this.rootFolder.updateForAddedVariable(object);
}

/** This method updates the dependencies of any children in the workspace
 * based on an object being deleted. */
visicomp.core.Workspace.prototype.updateForDeletedVariable = function(object) {
    this.rootFolder.updateForAddedVariable(object);
}

/** This method removes any data from this workspace. */
visicomp.core.Workspace.prototype.close = function() {
}

/** this method s implemented for the Owner component/mixin. */
visicomp.core.Workspace.prototype.getWorkspace = function() {
   return this;
}

//------------------------------
// Owner Methods
//------------------------------

/** this method s implemented for the Owner component/mixin. */
visicomp.core.Workspace.prototype.getBaseName = function() {
    return this.name;
}

//============================
// Save Functions
//============================

/** This is the supported file type. */
visicomp.core.Workspace.SAVE_FILE_TYPE = "visicomp workspace";

/** This is the supported file version. */
visicomp.core.Workspace.SAVE_FILE_VERSION = 0.1;

visicomp.core.Workspace.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.fileType = visicomp.core.Workspace.SAVE_FILE_TYPE;
    json.version = visicomp.core.Workspace.SAVE_FILE_VERSION;
    
    //controls
    json.data = this.rootFolder.toJson();
    
    return json;
}

/** This is used for saving the workspace. */
visicomp.core.Workspace.fromJson = function(json) {
    var name = json.name;
    var fileType = json.fileType;
	if((fileType !== visicomp.core.Workspace.SAVE_FILE_TYPE)||(!name)) {
		return {"success":false,"msg":"Bad file format."};
	}
    if(json.version != visicomp.core.Workspace.SAVE_FILE_VERSION) {
        return {"success":false,"msg":"Incorrect file version."};
    }
    
    //create the workspace
	var workspace = new visicomp.core.Workspace(name);
	
	//recreate the root folder
	var updateDataList = [];
    workspace.rootFolder = visicomp.core.Folder.fromJson(workspace,json.data,updateDataList);
    
    //set the data on all the objects
    var result;
    if(updateDataList.length > 0) {
        result = visicomp.core.updatemember.updateObjects(updateDataList);
            
        if(!result.success) {
            return result;
        }
    }
    
//figure out a better return
	return workspace;
}

//================================
// Member generator functions
//================================

visicomp.core.Workspace.memberGenerators = {};

/** This methods retrieves the member generator for the given type. */
visicomp.core.Workspace.getMemberGenerator = function(type) {
    return visicomp.core.Workspace.memberGenerators[type];
}

/** This method registers the member generator for a given named type. */
visicomp.core.Workspace.addMemberGenerator = function(generator) {
    visicomp.core.Workspace.memberGenerators[generator.type] = generator;
}