/** This is a folder. */
visicomp.core.Folder = function(owner,name) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,owner,name,visicomp.core.Folder.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
    visicomp.core.Owner.init.call(this);
    visicomp.core.Parent.init.call(this);

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
    
    //this only needs to be set once since we do not update it
    this.setData(this.dataMap);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Owner);
visicomp.core.util.mixin(visicomp.core.Folder,visicomp.core.Parent);

//------------------------------
// Parent Methods
//------------------------------

/** this method gets the table map. */
visicomp.core.Folder.prototype.getChildMap = function() {
    return this.childMap;
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
    if(child.isDataHolder) {
        this.dataMap[name] = child.getData();
    }
    
    //set all children as dependents
    this.calculateDependents();
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
    
    //set all children as dependents
    this.calculateDependents();
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

//------------------------------
// Dependent Methods
//------------------------------

/** This method updates the dependencies of any children
 * based on an object being added. */
visicomp.core.Folder.prototype.updateForAddedVariable = function(object) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateForAddedVariable(object);
        }
    }
}

/** This method updates the dependencies of any children
 * based on an object being deleted. */
visicomp.core.Folder.prototype.updateForDeletedVariable = function(object) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateForDeletedVariable(object);
        }
    }
}

//------------------------------
// Owner Methods
//------------------------------

/** this method s implemented for the Owner component/mixin. It will not be used
 * since this is also a parent, meaning it will not hold a root folder. */
visicomp.core.Folder.prototype.getBaseName = function() {
    return this.name;
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.Folder.fromJson = function(owner,json,updateDataList) {
    var folder = new visicomp.core.Folder(owner,json.name);
    
    for(var key in json.children) {
        var childJson = json.children[key];
        var childGenerator = visicomp.core.Workspace.getMemberGenerator(childJson.type);
        if(childGenerator) {
            var child = childGenerator.createMember(folder,childJson,updateDataList);
        }
        else {
            throw visicomp.core.util.createError("Member type not found: " + childJson.type);
        }
        
    }
    
    return folder;
}

/** This method adds any additional data to the json to save for this child. 
 * @protected */
visicomp.core.Folder.prototype.addToJson = function(json) {
	json.children = {};
    
    for(var key in this.childMap) {
        var child = this.childMap[key];
        json.children[key] = child.toJson();
    }
}

//============================
// Private methods
//============================

/** This method updates the table data object in the folder data map. 
 * @private */
visicomp.core.Folder.prototype.calculateDependents = function() {
    var newDependsOn = [];
    for(var name in this.childMap) {
        var object = this.childMap[name];
        if(object.isDataHolder) {
            newDependsOn.push(object);
        }
    }
    this.updateDependencies(newDependsOn);
}

//============================
// Static methods
//============================

visicomp.core.Folder.generator = {};
visicomp.core.Folder.generator.displayName = "Folder";
visicomp.core.Folder.generator.type = "visicomp.core.Folder";
visicomp.core.Folder.generator.createMember = visicomp.core.Folder.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Folder.generator);