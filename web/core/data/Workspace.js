/** This is the workspace. */
visicomp.core.Workspace = function(name) {
    //base init
    visicomp.core.EventManager.init.call(this);
    
    this.name = name;

    //add the root folder
	this.rootFolder = new visicomp.core.Folder(this,name);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Workspace,visicomp.core.EventManager);

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