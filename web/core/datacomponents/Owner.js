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
hax.core.Owner = {};

/** This initializes the component */
hax.core.Owner.init = function() {
}

hax.core.Owner.isOwner = true;

//must be implemented in extending object
///** This method retrieves the workspace for the child of this owner. */
//hax.core.Owner.getWorkspace = function();

//must be implemented in extending object
///** This method retrieves the full name whichis relevent for a root folder owned
// * by this object. */
//hax.core.Owner.getPossesionNameBase = function();

//must be implented by extending object
///** This method retrieves the context manager for this owner. */
//hax.core.Owner.getContextManager = function();


