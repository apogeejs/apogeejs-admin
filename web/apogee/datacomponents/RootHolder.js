/** This component encapsulates an object that contains a single child (usually a folder) which
 * is the "root" object for a hierarchy.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A RootHolder must be an Owner.
 */
apogee.RootHolder = {};

/** This initializes the component */
apogee.RootHolder.init = function() {
}

apogee.RootHolder.isRootHolder = true;

// Must be implemented in extending object
///** This method sets the root object.  */
//apogee.RootHolder.setRoot = function(member);

// Must be implemented in extending object
///** This method returns the root object.  */
//apogee.RootHolder.getRoot = function();

