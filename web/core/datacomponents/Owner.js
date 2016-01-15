/** This component encapsulates an object that owns a child. This is different from
 * Parent in that Parent a child within a data hierarchy. A Parent is an owner
 * but an Owner is also an object that owns a root folder, which has not parent.
 * Examples of Owners that are not parent are the Workspace, which holds the root folder
 * and the Worksheet, which is a data object but also holds a folder to own children too.
 * This will be used by other objects like worksheet taht need to contain a root folder
 * or contain a folder in addition to another data object. 
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


