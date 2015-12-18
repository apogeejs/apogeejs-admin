/** This is the workspace. */
visicomp.core.Workspace = function(name) {
    //base init
    visicomp.core.EventManager.init.call(this);
    
    this.name = name;

    //add the root folder
	this.rootFolder = new visicomp.core.Folder(this,name);
    
    //add an entry in the update code structure
    //this is placed here to make debugging easier.
    //This means we need to go and delete it if we clse the workspace.
    //Alternatively it could be stored somewhere in the workspace.
    visicomp.core.functionCode[name] = {};
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

/** This method removes any data from this workspace. */
visicomp.core.Workspace.prototype.close = function() {
    //add an entry in the update code structure
    delete visicomp.core.functionCode[this.name];
}