/** This component encapsulates an object that owns a child. This is different from
 * Parent in that Parent has a child within a data hierarchy. Parents are a subset of owners.
 * An object that owns a root folder if an owner but not a parent.
 * Examples of Owners that are not parent are the Workspace, which holds the workspace root folder
 * and the Worksheet, which is a data object which has its own root folder containing its children,
 * which are inaccessible from the rest of the workspace.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Owner must be a Child. The Child component must be installed before the
 * Codeable component.
 */
visicomp.core.Owner = {};

/** This initializes the component */
visicomp.core.Owner.init = function() {
}

visicomp.core.Owner.isOwner = true;

//must be implemented in extending object
///** This method retrieves the workspace for the child of this owner. */
//visicomp.core.Owner.getWorkspace = function();

//must be implemented in extending object
///** This method retrieves the base name whichis relevent for a root folder owned
// * by this object. */
//visicomp.core.Owner.getBaseName = function();


