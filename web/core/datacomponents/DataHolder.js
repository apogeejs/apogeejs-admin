/** This component encapsulates an object that holds data. The data is the object
 * that is accessed when the user calls the child name from the code.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A DataHolder must be a Child. The Child component must be installed before the
 * DataHolder component.
 * - A DataHolder must be an Impactor, as the data can be used by another object. The
 * Impactor component must be installed before the DataHolder component.
 */
visicomp.core.DataHolder = {};

/** This initializes the component */
visicomp.core.DataHolder.init = function() {
    
    this.data = null;
    this.dataError = null;
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
    this.internalSetData(data,null);
}

/** This method sets the error flag for this data holder, and it sets an error
 * message. The error is cleared by setting valid data, either through the 
 * set data method or in a calculation. */
visicomp.core.DataHolder.setDataError = function(actionError) {
    this.internalSetData(null,actionError);
}

visicomp.core.DataHolder.internalSetData = function(data,actionError) {
    
    this.data = data;
    this.dataError = actionError;
    
    //data the data map in the parent if it is a hierarchy container 
    if(this.parent) {
        this.parent.updateData(this);
    }
}

/** This method returns true if there is an dataError for this table, 
 * making the data invalid. */
visicomp.core.DataHolder.hasDataError = function() {
    return (this.dataError != null);
}

/** This returns the error messag. It should only be called
 * is hasError returns true. */
visicomp.core.DataHolder.getDataError = function() {
    return this.dataError;
}

/** This returns an array of members this member impacts. */
visicomp.core.DataHolder.getImpactsList = function() {
    return this.impactsList;
}

//===================================
// Private or Internal Functions
//===================================

/** This method adds a data member to the imapacts list for this node. 
 * @private */
visicomp.core.DataHolder.addToImpactsList = function(member) {
    //exclude this member
    if(member == this) return;
	
    //make sure it appears only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) return;
    }
    //add to the list
    this.impactsList.push(member);
}

/** This method removes a data member from the imapacts list for this node. 
 * @private */
visicomp.core.DataHolder.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}



