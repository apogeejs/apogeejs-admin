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

// Must be implemented in extending object
///** This method sets the root object.  */
//RootHolder.setRoot = function(model,member);

// Must be implemented in extending object
///** This method returns the root object.  */
//RootHolder.getRoot = function();

