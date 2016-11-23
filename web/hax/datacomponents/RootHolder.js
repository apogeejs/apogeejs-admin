/** This component encapsulates an object that contains a single child (usually a folder) which
 * is the "root" object for a hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A RootHolder must be an Owner.
 */
hax.RootHolder = {};

/** This initializes the component */
hax.RootHolder.init = function() {
}

hax.RootHolder.isRootHolder = true;

// Must be implemented in extending object
///** This method sets the root object.  */
//hax.RootHolder.setRoot = function(child);

// Must be implemented in extending object
///** This method returns the root object.  */
//hax.RootHolder.getRoot = function();

