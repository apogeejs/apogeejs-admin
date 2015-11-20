/** This is a package. */
visicomp.core.Package = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"package");
	this.isRoot = false;

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
    
    //this only needs to be set once since we do not update it
    this.setData(this.dataMap);
}

//extend the child object
visicomp.core.Package.prototype = Object.create(visicomp.core.Child);
visicomp.core.Package.prototype.constructor = visicomp.core.Package;

/** This method returns the full name in dot notation for this object. */
visicomp.core.Package.prototype.getFullName = function() {
	if(this.isRoot) {
        return this.getName();
    }   
    else {
        return visicomp.core.Child.getFullName.call(this);
    }
}

/** this is used to identify if this is the root package. */
visicomp.core.Package.prototype.isRootPackage = function() {
    return this.isRoot;
}

/** this is used to identify if this is the root package. */
visicomp.core.Package.prototype.setIsRootPackage = function(isRoot) {
    this.isRoot = isRoot;
}

/** This is used for saving the workspace. */
visicomp.core.Package.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    json.tables = {};
    for(var key in this.childMap) {
        var table = this.childMap[key];
        json.tables[key] = table.toJson();
    }
    return json;
}

/** this method gets the table map. */
visicomp.core.Package.prototype.getChildMap = function() {
    return this.childMap;
}

/** this method gets the data object for a child from this package. */
visicomp.core.Package.prototype.lookupChildData = function(name) {
    return this.dataMap[name];
}

/** This method looks up a child from this package.  */
visicomp.core.Package.prototype.lookupChild = function(name) {
    //check look for object in this package
    return this.childMap[name];
}

/** This method adds a table to the package. It also sets the package for the
 *table object to this package. It will fail if the name already exists.  */
visicomp.core.Package.prototype.addChild = function(child) {
	
    //check if it exists first
    var name = child.getName();
    if(this.childMap[name]) {
        //already exists!
        alert('Error - name already exists!');
        return;
    }
    //add object
    this.childMap[name] = child;
    this.dataMap[name] = child.getData();
	
    child.setParent(this);
}

/** This method removes a table from the package. It also sets the package
 * on the table object to null.  */
visicomp.core.Package.prototype.removeChild = function(child) {
    //only objects placed in the package go here, so they should have no parents
    if(child.getParent()) return;
	
    //remove from package
    var name = child.getName();
    delete(this.childMap[name]);
    delete(this.dataMap[name]);
	
    child.setParent(null);
}

/** This method updates the table data object in the package data map. */
visicomp.core.Package.prototype.updateData = function(child) {
    var name = child.getName();
    var data = child.getData();
    if(this.childMap[name] === undefined) {
        alert("Error - this table " + name + " has not yet been added to the package.");
        return;
    }
    this.dataMap[name] = data;
}

