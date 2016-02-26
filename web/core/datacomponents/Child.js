/** This component encapsulates the child functionality for members in the workspace,
 * allowing them to sit in a organizational hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 *  
 * COMPONENT DEPENDENCIES:
 * - For children that are DataHolders and consequentially Impactors, the Imapctor
 * component must be installed before the child component. As the child is added it
 * impacts its parent. 
 * 
 */
visicomp.core.Child = {};
    
/** This serves as the constructor for the child object, when extending it. 
 * The parent should be the folder that holds this child. If this is a root folder,
 * then the parent should instead be the object in which the object is the root folder
 * whcih can be the workspace or an other child (such as a worksheet). */
visicomp.core.Child.init = function(owner,name,generator) {
    this.name = name;
    this.generator = generator;
    this.errors = [];
    
    this.workspace = owner.getWorkspace();
    
    if(owner.isParent) {
        this.parent = owner;
        this.parent.addChild(this);
    }
    else {
        this.parent = null;
        this.baseName = owner.getBaseName();
    }
}

/** This property tells if this object is a child.
 * This property should not be implemented on non-children. */
visicomp.core.Child.isChild = true

/** this method gets the name. */
visicomp.core.Child.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
visicomp.core.Child.getFullName = function() {
	if(this.parent) {
		var name = this.parent.getFullName();

		if(!this.parent.isRoot()) {
			name += ".";
		}
		name += this.name;
		return name;
	}
	else {
		return this.baseName + ":";
	}
}

/** This method returns a display name for the child object. By default it returns
/* the object name but can by overriden by the child implementation. */
visicomp.core.Child.getDisplayName = function() {
    return this.name;
}

/** This returns the parent for this folder. For the root folder
 * this value is null. */
visicomp.core.Child.getParent = function() {
	return this.parent;
}

/** this method gets the workspace. */
visicomp.core.Child.getWorkspace = function() {
   return this.workspace;
}

/** this method gets the root folder/namespace for this object. */
visicomp.core.Child.getRootFolder = function() {
    var ancestor = this;
	while(ancestor) {
		var parent = ancestor.getParent();
        if(parent == null) {
            return ancestor;
        }
        ancestor = parent;
	} 
	return null; //this shouldn't happen
}

/** This identifies the type of object. */
visicomp.core.Child.getType = function() {
	return this.generator.type;
}


/** This method sets the pre calc error for this dependent. */
visicomp.core.Child.addError = function(error) {
    this.errors.push(error);
}

/** This method sets the pre calc error for this dependent. */
visicomp.core.Child.addErrors = function(errorList) {
    this.errors = this.errors.concat(errorList);
}

/** This method clears the error list. */
visicomp.core.Child.clearErrors = function(type) {
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
visicomp.core.Child.hasError = function() {
    return (this.errors.length > 0);
}

/** This returns the pre calc error. */
visicomp.core.Child.getErrors = function() {
    return this.errors;
}

/** This method writes the child to a json. */
visicomp.core.Child.toJson = function() {
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
//visicomp.core.Child.fromJson = function(workspace,json,updateDataList,actionResponse) {
//}

//========================================
// "Protected" Methods
//========================================

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  
 * @protected */
visicomp.core.Child.onDelete = function() {
	if(this.parent) {
		this.parent.removeChild(this);
	}
}

//Implement this method if there is data to add to this child. Otherwise it may
//be omitted
///** This method adds any additional data to the json saved for this child. 
// * @protected */
//visicomp.core.Child.addToJson = function(json) {
//}

//Implement this method if there is update data for this json. otherwise it may
//be omitted
///** This gets an update structure to upsate a newly instantiated child
//* to match the current object. It may return "undefined" if there is no update
//* data needed. 
//* @protected */
//visicomp.core.Child.getUpdateData = function() {
//}

