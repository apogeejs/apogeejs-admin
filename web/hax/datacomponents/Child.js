/** This component encapsulates the child functionality for members in the workspace,
 * allowing them to sit in a organizational hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 *  
 * COMPONENT DEPENDENCIES:
 * 
 */
hax.Child = {};
    
/** This serves as the constructor for the child object, when extending it. 
 * The owner should be the parent that holds this child or the object that holds
 * the hierarchy (maybe the workspace). If the owner is not a parent, this is typically
 * a folder and it is called the root folder. */
hax.Child.init = function(name,generator) {
    this.id = hax.Child._createId();
    this.name = name;
    this.generator = generator;
    this.errors = []; 
    this.resultPending = false;
}

hax.Child.initOwner = function(owner) {
    this.owner = owner;
    if(owner.isParent) {
        this.owner.addChild(this);
    }
    else if(owner.isRootHolder) {
        this.owner.setRoot(this);
    }
}

hax.Child.move = function(newName,newOwner) {
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
hax.Child.isChild = true

/** this method gets the ID. It is not persistent and is valid only for this 
 * instance the workspace is opened. */
hax.Child.getId = function() {
    return this.id;
}

/** this method gets the name. */
hax.Child.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
hax.Child.getFullName = function() {
    if(this.owner) {
        return this.owner.getPossesionNameBase() + this.name;
    }
    else {
        //this shouldn't happen
        return this.name;
    }
}

/** This method returns a display name for the child object. By default it returns
/* the object name but can by overriden by the child implementation. */
hax.Child.getDisplayName = function() {
    return this.name;
}

/** This returns the owner for this child. */
hax.Child.getOwner = function() {
    return this.owner;
}

/** This returns the parent for this child. For the root folder
 * this value is null. */
hax.Child.getParent = function() {
    if((this.owner)&&(this.owner.isParent)) {
        return this.owner;
    }
    else {
        return null;
    }
}

/** this method gets the workspace. */
hax.Child.getWorkspace = function() {
   if(this.owner) {
       return this.owner.getWorkspace();
   }
   else {
       return null;
   }
}

/** this method gets the root folder/namespace for this object. */
hax.Child.getRoot = function() {
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
hax.Child.addError = function(error) {
    this.errors.push(error);
}

/** This method sets the pre calc error for this dependent. */
hax.Child.addErrors = function(errorList) {
    this.errors = this.errors.concat(errorList);
}

/** This method clears the error list. */
hax.Child.clearErrors = function(type) {
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
hax.Child.hasError = function() {
    return (this.errors.length > 0);
}

/** This returns the pre calc error. */
hax.Child.getErrors = function() {
    return this.errors;
}

/** This returns true if the member is not up to date, typically
 * do to waiting on an asynchronous operation. */
hax.Child.getResultPending = function() {
    return this.resultPending;
}

/** This sets the result pending flag. */
hax.Child.setResultPending = function(isPending) {
    this.resultPending = isPending;
}

/** This method writes the child to a json. */
hax.Child.toJson = function() {
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
//hax.Child.fromJson = function(owner,json,childrenJsonOutputList) {
//}

//========================================
// "Protected" Methods
//========================================

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  
 * @protected */
hax.Child.onDeleteChild = function() {
    if(!(this.owner)) return;
    
	if(this.owner.isParent) {
		this.owner.removeChild(this);
	}
    else if(this.owner.isRootHolder) {
        this.owner.setRoot(null);
    }
    this.owner = null;
}

//Implement this method if there is data to add to this child. Otherwise it may
//be omitted
///** This method adds any additional data to the json saved for this child. 
// * @protected */
//hax.Child.addToJson = function(json) {
//}

//Implement this method if there is update data for this json. otherwise it may
//be omitted
///** This gets an update structure to upsate a newly instantiated child
//* to match the current object. It may return "undefined" if there is no update
//* data needed. 
//* @protected */
//hax.Child.getUpdateData = function() {
//}

/** This is used for Id generation.
 * @private */
hax.Child.nextId = 1;

/** This method generates a member ID for the child. It is only valid
 * for the duration the workspace is opened. It is not persisted.
 * @private
 */
hax.Child._createId = function() {
    return hax.Child.nextId++;
}

