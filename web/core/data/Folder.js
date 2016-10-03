/** This is a folder. */
hax.core.Folder = function(name,owner) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.Folder.generator);
    hax.core.DataHolder.init.call(this);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
    hax.core.Owner.init.call(this);
    hax.core.Parent.init.call(this);
    
    this.initOwner(owner);

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
	
	//make sure the data map is frozen
	Object.freeze(this.dataMap);
    this.setData(this.dataMap);
}

//add components to this class
hax.core.util.mixin(hax.core.Folder,hax.core.Child);
hax.core.util.mixin(hax.core.Folder,hax.core.DataHolder);
hax.core.util.mixin(hax.core.Folder,hax.core.Dependent);                      
hax.core.util.mixin(hax.core.Folder,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.Folder,hax.core.Owner);
hax.core.util.mixin(hax.core.Folder,hax.core.Parent);

//------------------------------
// Parent Methods
//------------------------------

/** this method gets the table map. */
hax.core.Folder.prototype.getChildMap = function() {
    return this.childMap;
}

/** This method looks up a child from this folder.  */
hax.core.Folder.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.childMap[name];
}

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
hax.core.Folder.prototype.addChild = function(child) {
	
    //check if it exists first
    var name = child.getName();
    if(this.childMap[name]) {
        //already exists! not fatal since it is not added to the model yet,
        throw hax.core.util.createError("There is already an object with the given name.",false);
    }
    //add object
    this.childMap[name] = child;
    if(child.isDataHolder) {
		var data = child.getData();
		//object may first appear with no data
		if(data !== undefined) {
			this.spliceDataMap(name,data);
		}
    }
    
    //set all children as dependents
    this.calculateDependents();
}

/** This method removes a table from the folder. */
hax.core.Folder.prototype.removeChild = function(child) {
    //make sure this is a child of this object
	var parent = child.getParent();
    if((!parent)||(parent !== this)) return;
	
    //remove from folder
    var name = child.getName();
    delete(this.childMap[name]);
	if(child.isDataHolder) {
		this.spliceDataMap(name);
	}
    
    //set all children as dependents
    this.calculateDependents();
}

/** This method updates the table data object in the folder data map. */
hax.core.Folder.prototype.updateData = function(child) {
	if(!child.isDataHolder) return;
	
    var name = child.getName();
    var data = child.getData();
    if(this.childMap[name] === undefined) {
        alert("Error - this table " + name + " has not yet been added to the folder.");
        return;
    }
	this.spliceDataMap(name,data);
}

/** There is no calculation for the folder base on dependents. 
 * @private */
hax.core.Folder.prototype.needsCalculating = function() {
    return false;
}

/** There is no calculation in the folder.  */
hax.core.Folder.prototype.calculate = function() {
    
}

//------------------------------
// Dependent Methods
//------------------------------

/** This method updates the dependencies of any children
 * based on an object being added. */
hax.core.Folder.prototype.updateForAddedVariable = function(object,recalculateList) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateForAddedVariable(object,recalculateList);
        }
    }
}

/** This method updates the dependencies of any children
 * based on an object being deleted. */
hax.core.Folder.prototype.updateForDeletedVariable = function(object,recalculateList) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateForDeletedVariable(object,recalculateList);
        }
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.core.Folder.fromJson = function(owner,json,updateDataList,actionResponse) {
    var folder = new hax.core.Folder(json.name,owner);
    
    for(var key in json.children) {
        var childJson = json.children[key];
        var child = hax.core.createmember.instantiateMember(folder,childJson,updateDataList,actionResponse);
    }
    
    return folder;
}

/** This method adds any additional data to the json to save for this child. 
 * @protected */
hax.core.Folder.prototype.addToJson = function(json) {
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
hax.core.Folder.prototype.calculateDependents = function() {
    var newDependsOn = [];
    for(var name in this.childMap) {
        var object = this.childMap[name];
        if(object.isDataHolder) {
            newDependsOn.push(object);
        }
    }
    this.updateDependencies(newDependsOn);
}

/** This method creates a new immutable data map, either adding a give name and data or
 * removing a name. To remove a name from the map, leave "addData" as undefined. 
 * @private */
hax.core.Folder.prototype.spliceDataMap = function(addOrRemoveName,addData) {
	var newDataMap = {};
	
	//copy old data
	for(var key in this.dataMap) {
		if(key !== addOrRemoveName) {
			newDataMap[key] = this.dataMap[key];
		}
	}
	//add or update thiis child data
	if(addData !== undefined) {
		newDataMap[addOrRemoveName] = addData;
	}
	
	//make this immutable and set it as data for this folder
	Object.freeze(newDataMap);
	this.dataMap = newDataMap;
	this.setData(this.dataMap);
}

//============================
// Static methods
//============================

hax.core.Folder.generator = {};
hax.core.Folder.generator.displayName = "Folder";
hax.core.Folder.generator.type = "hax.core.Folder";
hax.core.Folder.generator.createMember = hax.core.Folder.fromJson;

//register this member
hax.core.Workspace.addMemberGenerator(hax.core.Folder.generator);