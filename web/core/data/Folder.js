/** This is a folder. */
visicomp.core.Folder = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"folder");
	this.isRoot = false;

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
    
    //this only needs to be set once since we do not update it
    this.setData(this.dataMap);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Child);

/** this is used to identify if this is the root folder. */
visicomp.core.Folder.prototype.isRootFolder = function() {
    //undefined may be OK too. If there is populated object this is no root.
    return (this.parent == null); 
}

/** this method gets the table map. */
visicomp.core.Folder.prototype.getChildMap = function() {
    return this.childMap;
}

/** this method gets the data object for a child from this folder. */
visicomp.core.Folder.prototype.lookupChildData = function(name) {
    return this.dataMap[name];
}

/** This method looks up a child from this folder.  */
visicomp.core.Folder.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.childMap[name];
}

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
visicomp.core.Folder.prototype.addChild = function(child) {
	
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

/** This method removes a table from the folder. It also sets the folder
 * on the table object to null.  */
visicomp.core.Folder.prototype.removeChild = function(child) {
    //make sure this is a child of this object
	var parent = child.getParent();
    if((!parent)||(parent !== this)) return;
	
    //remove from folder
    var name = child.getName();
    delete(this.childMap[name]);
    delete(this.dataMap[name]);
	
    child.setParent(null);
}

/** This method updates the table data object in the folder data map. */
visicomp.core.Folder.prototype.updateData = function(child) {
    var name = child.getName();
    var data = child.getData();
    if(this.childMap[name] === undefined) {
        alert("Error - this table " + name + " has not yet been added to the folder.");
        return;
    }
    this.dataMap[name] = data;
}

visicomp.core.Folder.prototype.createFunctionInContext = function(functionText) {
//TODO implement
    alert("NOT IMPLEMNETED!");
}

