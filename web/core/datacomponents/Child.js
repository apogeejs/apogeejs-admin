/** This encapsulates the namespace functionality of the objects in the workspace.
 * The namespaces are given by folders and the extending objects represent items
 * in the namespace (including folders, tables, functions, etc.). Each object can
 * have a data object, such as a JSON for a table, which is what the developer will
 * access for the given name.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Child = {};
    
/** This serves as the constructor for the child object, when extending it. */
visicomp.core.Child.init = function(workspace,name,type) {
    this.workspace = workspace;
    this.name = name;
    this.type = type;
    this.parent = null;
    this.data = null;
}

/** this method gets the name. */
visicomp.core.Child.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
visicomp.core.Child.getFullName = function() {
	if(this.parent) {
		if(this.parent.isRoot) {
			return this.name;
		}
		else {
			return this.parent.getFullName() + "." + this.name;
		}
	}
	else {
		return this.name;
	}
}

/** This returns the parent for this folder. For the root folder
 * this value is null. */
visicomp.core.Child.getParent = function() {
	return this.parent;
}

/** This sets the parent for this folder.
 * @private*/
visicomp.core.Child.setParent = function(parent) {
	this.parent = parent;
    if(parent.workspace != this.workspace) {
        //we might want to write code to change the child workspace, and that of it offspring. Or maybe not.
        throw visicomp.core.util.createError("The chils and parent must be in the same workspace.");
    }
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
	return this.type;
}

//========================================
// "Protected" Methods
//========================================

/** This method is called when the child is deleted. If necessary the implementation
 * can extend this function, but it should call this base version of the function
 * if it does.  */
visicomp.core.Child.onDelete = function() {
	if((this.parent != null)&&(this.parent.getType() === "folder")) {
		this.parent.removeChild(this);
	}
}

