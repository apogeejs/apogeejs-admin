/** This component encapsulates an object that owns a child. This is different from
 * Parent in that Parent has a child within a data hierarchy. Parents are a subset of owners.
 * An object that owns a root folder if an owner but not a parent.
 * Examples of Owners that are not parent are the Workspace, which holds the workspace root folder
 * and the FolderFunction, which is a data object which has its own root folder containing its children,
 * which are inaccessible from the rest of the workspace.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * An Owner must be a Context Holder
 */
hax.Owner = {};

/** This initializes the component */
hax.Owner.init = function() {
}

hax.Owner.isOwner = true;

//must be implemented in extending object
///** This method retrieves the workspace for the child of this owner. */
//hax.Owner.getWorkspace = function();

//must be implemented in extending object
///** This method retrieves the full name whichis relevent for a root folder owned
// * by this object. */
//hax.Owner.getPossesionNameBase = function();

//must be implented by extending object
///** This method retrieves the context manager for this owner. */
//hax.Owner.getContextManager = function();

/** This method looks up a member by its full name. */
hax.Owner.getMemberByFullName = function(fullName) {
    var path = fullName.split(".");
    return this.getMemberByPathArray(path);
}

///** This method looks up a member by an array path. The start element is
// * the index of the array at which to start. */
//hax.Owner.getMemberByPathArray = function(path,startElement);

