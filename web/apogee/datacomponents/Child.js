/** This component encapsulates the child functionality for members in the workspace,
 * allowing them to sit in a organizational hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 *  
 * COMPONENT DEPENDENCIES:
 * 
 */
apogee.Child = {};
    
/** This serves as the constructor for the child object, when extending it. 
 * The owner should be the parent that holds this child or the object that holds
 * the hierarchy (maybe the workspace). If the owner is not a parent, this is typically
 * a folder and it is called the root folder. */
apogee.Child.init = function(name,generator) {
    this.id = apogee.Child._createId();
    this.name = name;
    
    this.data = null;
    this.impactsList = [];
    
    this.generator = generator;
    this.errors = []; 
    this.resultPending = false;
}

apogee.Child.initOwner = function(owner) {
    this.owner = owner;
    if(owner.isParent) {
        this.owner.addChild(this);
    }
    else if(owner.isRootHolder) {
        this.owner.setRoot(this);
    }
}

apogee.Child.move = function(newName,newOwner) {
    //remove from old owner
    if(this.owner) {
        if(this.owner.isParent) {
            this.owner.removeChild(this);
        }
        else {
            //don't allow moving a root for now!
            //or renaiming either!
        }
    }
    //change name
    this.name = newName;
    
    //place in the new owner
    this.initOwner(newOwner);
}

/** This property tells if this object is a child.
 * This property should not be implemented on non-children. */
apogee.Child.isChild = true

/** this method gets the ID. It is not persistent and is valid only for this 
 * instance the workspace is opened. */
apogee.Child.getId = function() {
    return this.id;
}

/** this method gets the name. */
apogee.Child.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
apogee.Child.getFullName = function() {
    if(this.owner) {
        return this.owner.getPossesionNameBase() + this.name;
    }
    else {
        //this shouldn't happen
        return this.name;
    }
}

/** This method returns a display name for the child object. By default it returns
/* the object name but can by overriden by the child implementation. By setting 
 * the input argument "useFullPath" to true, the path is included with the name. */
apogee.Child.getDisplayName = function(useFullPath) {
    if(useFullPath) {
        return this.getFullName();
    }
    else {
        return this.name;
    }
}

/** This returns the owner for this child. */
apogee.Child.getOwner = function() {
    return this.owner;
}

/** This returns the parent for this child. For the root folder
 * this value is null. */
apogee.Child.getParent = function() {
    if((this.owner)&&(this.owner.isParent)) {
        return this.owner;
    }
    else {
        return null;
    }
}

/** this method gets the workspace. */
apogee.Child.getWorkspace = function() {
   if(this.owner) {
       return this.owner.getWorkspace();
   }
   else {
       return null;
   }
}

/** this method gets the root folder/namespace for this object. */
apogee.Child.getRoot = function() {
    var ancestor = this;
	while(ancestor) {
		var owner = ancestor.getOwner();
        if(!owner) {
            return null;
        }
        else if(!owner.isParent) {
            return ancestor;
        }
        ancestor = owner;
	} 
	return null; //this shouldn't happen
}

/** This method sets the pre calc error for this dependent. */
apogee.Child.addError = function(error) {
    this.errors.push(error);
}

/** This method sets the pre calc error for this dependent. */
apogee.Child.addErrors = function(errorList) {
    this.errors = this.errors.concat(errorList);
}

/** This method clears the error list. */
apogee.Child.clearErrors = function(type) {
    var newList = [];
    if(type != null) {    
        for(var i = 0; i < this.errors.length; i++) {
            var entry = this.errors[i];
            if(entry.type != type) {
                newList.push(entry);
            }
        }
    }
    this.errors = newList;
}

/** This returns true if there is a pre calc error. */
apogee.Child.hasError = function() {
    return (this.errors.length > 0);
}

/** This returns the pre calc error. */
apogee.Child.getErrors = function() {
    return this.errors;
}

/** This returns true if the member is not up to date, typically
 * do to waiting on an asynchronous operation. */
apogee.Child.getResultPending = function() {
    return this.resultPending;
}

/** This sets the result pending flag. If is pending is set to true a
 * pending token must be set. (from apogee.action.getPendingToken) This 
 * is used to ensure only the latest asynchronous action is kept. */
apogee.Child.setResultPending = function(isPending,pendingToken) {
    this.resultPending = isPending;
    this.pendingToken = pendingToken;
}

/** This returns true if the pending token matches. */
apogee.Child.pendingTokenMatches = function(pendingToken) {
    return (this.pendingToken === pendingToken);
}

apogee.Child.getSetDataOk = function() {
    return this.generator.setDataOk;
}

apogee.Child.getSetCodeOk = function() {
    return this.generator.setCodeOk;
}

/** This method writes the child to a json. */
apogee.Child.toJson = function() {
	var json = {};
    json.name = this.name;
    json.type = this.generator.type;
    if(this.addToJson) {
        this.addToJson(json);
    }
    
    if(this.getUpdateData) {
        var updateData = this.getUpdateData();
        json.updateData = updateData;
    }
    return json;
}

///** This method creates a child from a json. IT should be implemented as a static
// * function in extending objects. */ 
//apogee.Child.fromJson = function(owner,json,childrenJsonOutputList) {
//}

//-----------------------------------
// Data methods
//-----------------------------------

/** this method gets the data map. */
apogee.Child.getData = function() {
    return this.data;
}

/** This returns an array of members this member impacts. */
apogee.Child.getImpactsList = function() {
    return this.impactsList;
}

/** This method sets the data for this object. This is the object used by the 
 * code which is identified by this name, for example the JSON object associated
 * with a JSON table. Besides hold the data object, this updates the parent data map. */
apogee.Child.setData = function(data) {
    this.data = data;
  
    var parent = this.getParent();
    if(parent) {
        parent.updateData(this);
    }
}

//========================================
// "Protected" Methods
//========================================

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  
 * @protected */
apogee.Child.onDeleteChild = function() {
    if(!(this.owner)) return;
    
	if(this.owner.isParent) {
		this.owner.removeChild(this);
	}
    else if(this.owner.isRootHolder) {
        this.owner.setRoot(null);
    }
    this.owner = null;
}

///** This method is called when the workspace is closed and also when an object
// * is deleted. It should do any needed cleanup for the object.  
// * @protected */
//apogee.Child.onClose = function();

//Implement this method if there is data to add to this child. Otherwise it may
//be omitted
///** This method adds any additional data to the json saved for this child. 
// * @protected */
//apogee.Child.addToJson = function(json) {
//}

//Implement this method if there is update data for this json. otherwise it may
//be omitted
///** This gets an update structure to upsate a newly instantiated child
//* to match the current object. It may return "undefined" if there is no update
//* data needed. 
//* @protected */
//apogee.Child.getUpdateData = function() {
//}


//===================================
// Private Functions
//===================================

/** This method adds a data member to the imapacts list for this node.
 * The return value is true if the member was added and false if it was already there. 
 * @private */
apogee.Child.addToImpactsList = function(member) {
    //exclude this member
    if(member === this) return;
    
    //add to the list iff it is not already there
    if(this.impactsList.indexOf(member) === -1) {
        this.impactsList.push(member);
        return true;
    }
    else {
        return false;
    }
}

/** This method removes a data member from the imapacts list for this node. 
 * @private */
apogee.Child.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}

/** This is used for Id generation.
 * @private */
apogee.Child.nextId = 1;

/** This method generates a member ID for the child. It is only valid
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
apogee.Child._createId = function() {
    return apogee.Child.nextId++;
}

