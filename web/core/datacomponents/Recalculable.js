/** This mixin encapsulates an object needs to be recalculated, based on 
 * changes in dependants
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Recalculable = {};

/** This initializes the component */
visicomp.core.Recalculable.init = function() {
}

/** This property returns true if the object is a recalculable.
 * This property should not be implemented on 
 * non-recalculables. */
visicomp.core.Recalculable.isRecalculable = true


/** This method indicates if the member needs to be calculated.
 * It should be implemented in inheriting objects. 
 * */
//visicomp.core.Recalculable.needsExecuting = function() {}


/** This method updates an object after its dependencies have been updated.
 * It should be implemented by inheriting objects.  */
//visicomp.core.Recalculable.execute = function() {}
