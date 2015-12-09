/** This mixin encapsulates an object that holds data. The data is held in the 
 * folder data hierarchy that mirrors the folder object hierarchy. Objects
 * that are dependats my only depend on objects that are data holders (so that 
 * there is something to depend on.) 
 * 
 * The DataHolder must be a child.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Impactor = {};

/** This initializes the component */
visicomp.core.Impactor.init = function() {
    
    //these are a list of members that depend on this member
    this.impactsList = [];
}

/** This property tells if this object is a data holder.
 * This property should not be implemented on non-data holders. */
visicomp.core.Impactor.isImpactor = true

/** This returns an array of members this member impacts. */
visicomp.core.Impactor.getImpactsList = function() {
    return this.impactsList;
}

//===================================
// Private or Internal Functions
//===================================

/** This method adds a data member to the imapacts list for this node. 
 * @private */
visicomp.core.Impactor.addToImpactsList = function(member) {
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
visicomp.core.Impactor.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}



