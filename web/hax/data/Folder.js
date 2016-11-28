/** This is a folder. */
hax.Folder = function(name,owner) {
    //base init
    hax.Child.init.call(this,name,hax.Folder.generator);
    hax.DataHolder.init.call(this);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
    hax.Owner.init.call(this);
    hax.Parent.init.call(this);
    
    this.initOwner(owner);

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
	
	//make sure the data map is frozen
	Object.freeze(this.dataMap);
    this.setData(this.dataMap);
}

//add components to this class
hax.base.mixin(hax.Folder,hax.Child);
hax.base.mixin(hax.Folder,hax.DataHolder);
hax.base.mixin(hax.Folder,hax.Dependent);                      
hax.base.mixin(hax.Folder,hax.ContextHolder);
hax.base.mixin(hax.Folder,hax.Owner);
hax.base.mixin(hax.Folder,hax.Parent);

//------------------------------
// Parent Methods
//------------------------------

/** this method gets the table map. */
hax.Folder.prototype.getChildMap = function() {
    return this.childMap;
}

/** This method looks up a child from this folder.  */
hax.Folder.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.childMap[name];
}

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
hax.Folder.prototype.addChild = function(child) {
	
    //check if it exists first
    var name = child.getName();
    if(this.childMap[name]) {
        //already exists! not fatal since it is not added to the model yet,
        throw hax.base.createError("There is already an object with the given name.",false);
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
hax.Folder.prototype.removeChild = function(child) {
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
hax.Folder.prototype.updateData = function(child) {
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
hax.Folder.prototype.needsCalculating = function() {
    return true;
}

/** Calculate the data.  */
hax.Folder.prototype.calculate = function() {
    //we don't need to calculate since the calculate is done on the fly
    //we just need to make sure the impactors are set
    this.initializeImpactors();
    
    this.clearCalcPending();
}

//------------------------------
// Dependent Methods
//------------------------------

/** This method updates the dependencies of any children
 * based on an object being added. */
hax.Folder.prototype.updateDependeciesForModelChange = function(recalculateList) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateDependeciesForModelChange(recalculateList);
        }
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.Folder.fromJson = function(owner,json,childrenJsonOutputList) {
    var folder = new hax.Folder(json.name,owner);
    
    for(var key in json.children) {
        var childJson = json.children[key];
        childrenJsonOutputList.push(childJson);
    }
    
    return folder;
}

/** This method adds any additional data to the json to save for this child. 
 * @protected */
hax.Folder.prototype.addToJson = function(json) {
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
hax.Folder.prototype.calculateDependents = function() {
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
hax.Folder.prototype.spliceDataMap = function(addOrRemoveName,addData) {
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

hax.Folder.generator = {};
hax.Folder.generator.displayName = "Folder";
hax.Folder.generator.type = "hax.Folder";
hax.Folder.generator.createMember = hax.Folder.fromJson;

//register this member
hax.Workspace.addMemberGenerator(hax.Folder.generator);