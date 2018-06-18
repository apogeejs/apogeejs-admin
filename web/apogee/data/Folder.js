/** This is a folder. */
apogee.Folder = function(name,owner) {
    //base init
    apogee.Member.init.call(this,name,apogee.Folder.generator);
    apogee.Dependent.init.call(this);
    apogee.ContextHolder.init.call(this);
    apogee.Owner.init.call(this);
    apogee.Parent.init.call(this);
    
    this.initOwner(owner);

    //this holds the base objects, mapped by name
    this.childMap = {};
    this.dataMap = {};
	
	//make sure the data map is frozen
	Object.freeze(this.dataMap);
    this.setData(this.dataMap);
}

//add components to this class
apogee.base.mixin(apogee.Folder,apogee.Member);
apogee.base.mixin(apogee.Folder,apogee.Dependent);                      
apogee.base.mixin(apogee.Folder,apogee.ContextHolder);
apogee.base.mixin(apogee.Folder,apogee.Owner);
apogee.base.mixin(apogee.Folder,apogee.Parent);

//------------------------------
// Parent Methods
//------------------------------

/** this method gets the table map. */
apogee.Folder.prototype.getChildMap = function() {
    return this.childMap;
}

/** This method looks up a child from this folder.  */
apogee.Folder.prototype.lookupChild = function(name) {
    //check look for object in this folder
    return this.childMap[name];
}

/** This method adds a table to the folder. It also sets the folder for the
 *table object to this folder. It will fail if the name already exists.  */
apogee.Folder.prototype.addChild = function(child) {
	
    //check if it exists first
    var name = child.getName();
    if(this.childMap[name]) {
        //already exists! not fatal since it is not added to the model yet,
        throw apogee.base.createError("There is already an object with the given name.",false);
    }
    //add object
    this.childMap[name] = child;
    
    var data = child.getData();
    //object may first appear with no data
    if(data !== undefined) {
        this.spliceDataMap(name,data);
    }
    
    //set all children as dependents
    this.calculateDependents();
}

/** This method removes a table from the folder. */
apogee.Folder.prototype.removeChild = function(child) {
    //make sure this is a child of this object
	var parent = child.getParent();
    if((!parent)||(parent !== this)) return;
	
    //remove from folder
    var name = child.getName();
    delete(this.childMap[name]);
    this.spliceDataMap(name);
    
    //set all children as dependents
    this.calculateDependents();
}

/** This method updates the table data object in the folder data map. */
apogee.Folder.prototype.updateData = function(child) {
	
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
apogee.Folder.prototype.needsCalculating = function() {
    return true;
}

/** Calculate the data.  */
apogee.Folder.prototype.calculate = function() {
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
apogee.Folder.prototype.updateDependeciesForModelChange = function(recalculateList) {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.isDependent) {
            child.updateDependeciesForModelChange(recalculateList);
        }
    }
}

//------------------------------
// Member Methods
//------------------------------

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
apogee.Folder.fromJson = function(owner,json,childrenJsonOutputList) {
    var folder = new apogee.Folder(json.name,owner);
    if(json.childrenNotWriteable) {
        folder.setChildrenWriteable(false);
    }
    
    for(var key in json.children) {
        var childJson = json.children[key];
        childrenJsonOutputList.push(childJson);
    }
    
    return folder;
}

/** This method adds any additional data to the json to save for this member. 
 * @protected */
apogee.Folder.prototype.addToJson = function(json) {
	json.children = {};
    
    if(!this.getChildrenWriteable()) {
        json.childrenNotWriteable = true;
    }
    
    for(var key in this.childMap) {
        var child = this.childMap[key];
        json.children[key] = child.toJson();
    }
}

apogee.Folder.prototype.onClose = function () {
    for(var key in this.childMap) {
        var child = this.childMap[key];
        if(child.onClose) child.onClose();
    }
}

//============================
// Private methods
//============================

/** This method updates the table data object in the folder data map. 
 * @private */
apogee.Folder.prototype.calculateDependents = function() {
    var newDependsOn = [];
    for(var name in this.childMap) {
        var child = this.childMap[name];
        newDependsOn.push(child);
    }
    this.updateDependencies(newDependsOn);
}

/** This method creates a new immutable data map, either adding a give name and data or
 * removing a name. To remove a name from the map, leave "addData" as undefined. 
 * @private */
apogee.Folder.prototype.spliceDataMap = function(addOrRemoveName,addData) {
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

apogee.Folder.generator = {};
apogee.Folder.generator.displayName = "Folder";
apogee.Folder.generator.type = "apogee.Folder";
apogee.Folder.generator.createMember = apogee.Folder.fromJson;
apogee.Folder.generator.setDataOk = false;
apogee.Folder.generator.setCodeOk = false;

//register this member
apogee.Workspace.addMemberGenerator(apogee.Folder.generator);