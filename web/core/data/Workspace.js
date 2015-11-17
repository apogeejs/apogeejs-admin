/** This is the workspace. */
visicomp.core.Workspace = function(name,eventManager) {
    this.name = name;
    this.rootPackage = null;
    this.eventManager = eventManager;
    
    //add an entry in the update code structure
    visicomp.core.updateCode[name] = {};
}

/** this method gets the workspace name. */
visicomp.core.Workspace.prototype.getName = function() {
    return this.name;
}

/** This is used for saving the workspace. */
visicomp.core.Workspace.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.packages = {};
    for(var key in this.packageMap) {
        var package = this.packageMap[key];
        json.packages[key] = package.toJson();
    }
    return json;
}

/** this method gets the context command. */
visicomp.core.Workspace.prototype.getEventManager = function() {
    return this.eventManager;
}

/** this method gets the root packaage for the workspace. */
visicomp.core.Workspace.prototype.getRootPackage = function() {
    return this.rootPackage;
}

/** this method gets the root packaage for the workspace.
 * @private */
visicomp.core.Workspace.prototype.setRootPackage = function(package) {
    this.rootPackage = package;
}

/////////////////////////////////////////////////////////////////////
// temp functions for incremental development

//
//
///** This adds a package to the app object map. */
//visicomp.core.Workspace.prototype.addPackage = function(package) {
//	this.rootPackage.addChild(package);
//	
////    var packageName = package.getName();
////    if(this.packageMap[packageName]) {
////        alert("Error - there is already a package with this name.");
////        return;
////    }
////    this.packageMap[packageName] = package;
////	
////    package.setWorkspace(this);
//}
//
///** This removes a package from the app object map */
//visicomp.core.Workspace.prototype.removePackage = function(package) {
//	this.rootPackage.removeChild(package);
//	
////    //dont check for repeats here for now
////    var packageName = package.getName();
////    delete this.packageMap[packageName];
//}
//
///** This method returns the package of the given name. */
//visicomp.core.Workspace.prototype.lookupPackage = function(name) {
//    return this.rootPackage.lookupChild(name);
//}
//
///** This method returns themap of packages in the workspace. */
//visicomp.core.Workspace.prototype.getPackageMap = function() {
//    return this.rootPackate.getData();
//}
//
