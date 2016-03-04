/** This component encapsulates an object that contains children, creating  a 
 * hierarchical structure in the workspace. Each child has a name and this name
 * forms the index of the child into its parent. (I guess that means it doesn't
 * have to be a string, in the case we made an ArrayFolder, which would index the
 * children by integer.) The Parent must also be a child.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Parent must be a Child. The Child component must be installed before the
 * Codeable component.
 * - A Parent must be an Owner. The Owner component must be installed before the 
 * Parent component.
 */
visicomp.core.Parent = {};

/** This initializes the component */
visicomp.core.Parent.init = function() {
    
    //set the context manager
    this.contextManager = new visicomp.core.ContextManager(this.getOwner());
    //add an entry for this folder. Make it local unless this si a root folder
    var myEntry = {};
    myEntry.isLocal = !this.isRoot();
    myEntry.parent = this;
    this.contextManager.addToContextList(myEntry);
}

visicomp.core.Parent.isParent = true;


/** this is used to identify if this is the root folder. */
visicomp.core.Parent.isRoot = function() {
    //undefined may be OK too. If there is populated object this is not root.
    return (this.getParent() == null); 
}

/** This method returns the contextManager for this parent.  */
visicomp.core.Parent.getContextManager = function() {
    return this.contextManager;
}

///** this method gets a map of child names to children. This may not be the structure
// * of the data in the parent, but it is the prefered common representation. */
//visicomp.core.Parent.getChildMap = function();

// Must be implemented in extending object
///** This method looks up a child from this folder.  */
//visicomp.core.Folder.lookupChild = function(name);

/** This method looks up a child using an arry of names corresponding to the
 * path from this folder to the object.  Note: the method will return the 
 * fist non-folder it finds, even if the path is not completed. In this case
 * it is assumed the path refers to a field inside this object. */
visicomp.core.Parent.lookupChildFromPath = function(path) {
	var object = this;
	for(var i = 0; ((object)&&(i < path.length)&&(object.isParent)); i++) {
		object = object.lookupChild(path[i]);
	}
    return object;
}

// Must be implemented in extending object
///** This method adds the child to this parent. 
// * It will fail if the name already exists.  */
//visicomp.core.Parent.addChild = function(child);

// Must be implemented in extending object
///** This method removes this child from this parent.  */
//visicomp.core.Folder.removeChild = function(child);

// Must be implemented in extending object
///** This method updates the data object for this child. */
//visicomp.core.Folder.updateData = function(child);

