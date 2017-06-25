/** This component encapsulates an object that holds data. The data is the object
 * that is accessed when the user calls the child name from the code. Any object that
 * is a data holder can serve to impact a dependent.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A DataHolder must be a Child.
 */
apogee.DataHolder = {};

/** This initializes the component */
apogee.DataHolder.init = function() {
    this.data = null;
    
    //these are a list of members that depend on this member
    this.impactsList = [];
}

/** This property tells if this object is a data holder.
 * This property should not be implemented on non-data holders. */
apogee.DataHolder.isDataHolder = true;

/** this method gets the data map. */
apogee.Child.getData = function() {
    return this.data;
}

/** This returns an array of members this member impacts. */
apogee.DataHolder.getImpactsList = function() {
    return this.impactsList;
}

/** This method sets the data for this object. This is the object used by the 
 * code which is identified by this name, for example the JSON object associated
 * with a JSON table. Besides hold the data object, this updates the parent data map. */
apogee.DataHolder.setData = function(data) {
    this.data = data;
  
    var parent = this.getParent();
    if(parent) {
        parent.updateData(this);
    }
}

//===================================
// Private or Internal Functions
//===================================

/** This method adds a data member to the imapacts list for this node.
 * The return value is true if the member was added and false if it was already there. 
 * @private */
apogee.DataHolder.addToImpactsList = function(member) {
    //exclude this member
    if(member === this) return;
    
    //add to the list iff it is not already there
    if(this.impactsList.indexOf(member) === -1) {
        this.impactsList.push(member);
        return true;
    }
    else {
        return false;
    }
}

/** This method removes a data member from the imapacts list for this node. 
 * @private */
apogee.DataHolder.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}







