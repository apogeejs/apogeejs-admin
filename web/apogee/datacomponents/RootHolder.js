/** This component encapsulates an owner object which is not a member and it contains a single child (usually a folder) which
 * is the "root" object for a hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A RootHolder must be an Owner.
 */
let RootHolder = {};
export {RootHolder as default};

RootHolder.isRootHolder = true;

//REMOVED===================================
// Must be implemented in extending object
// /** This method sets the root object.  */
// RootHolder.setRoot = function(model,member);

// Must be implemented in extending object
// /** This method returns the root object.  */
// RootHolder.getRoot = function();
//========================================

//NEW=====================================

// Must be implemented in extending object
///** This method looks up a child from this folder.  */
//RootHolder.lookupChild = function(name);

// Must be implemented in extending object
///** This method adds the child to this parent. 
// * It will fail if the name already exists.  */
//RootHolder.addChild = function(model,child);

// Must be implemented in extending object
///** This method removes this child from this parent.  */
//RootHolder.removeChild = function(model,child);

