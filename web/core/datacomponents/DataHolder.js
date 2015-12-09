/** This mixin encapsulates an object that holds data. The data is held in the 
 * folder data hierarchy that mirrors the folder object hierarchy. Objects
 * that are dependats my only depend on objects that are data holders (so that 
 * there is something to depend on.) 
 * 
 * The DataHolder must be a child.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
visicomp.core.DataHolder = {};

/** This initializes the component */
visicomp.core.DataHolder.init = function() {
    
    this.data = null;
    
    //these are a list of members that depend on this member
    this.impactsList = [];
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
 * with a table. Besides hold the data object, this updates the parent data map. */
visicomp.core.DataHolder.setData = function(data) {
    this.data = data;
    
    //data the data map in the parent if it is a hierarchy container 
    if((this.parent)&&(this.parent.getType() == "folder")) {
        this.parent.updateData(this);
    }
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



