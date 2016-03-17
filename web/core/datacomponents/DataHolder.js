/** This component encapsulates an object that holds data. The data is the object
 * that is accessed when the user calls the child name from the code.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A DataHolder must be a Child.
 * - A DataHolder must be an Impactor.
 */
visicomp.core.DataHolder = {};

/** This initializes the component */
visicomp.core.DataHolder.init = function() {
    this.data = null;
}

/** This property tells if this object is a data holder.
 * This property should not be implemented on non-data holders. */
visicomp.core.DataHolder.isDataHolder = true

/** this method gets the data map. */
visicomp.core.Child.getData = function() {
    return this.data;
}

/** This method sets the data for this object. This is the object used by the 
 * code which is identified by this name, for example the JSON object associated
 * with a JSON table. Besides hold the data object, this updates the parent data map. */
visicomp.core.DataHolder.setData = function(data) {
    this.data = data;
    
    var parent = this.getParent();
    if(parent) {
        parent.updateData(this);
    }
}







