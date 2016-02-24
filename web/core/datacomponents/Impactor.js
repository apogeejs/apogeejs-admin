/** This component encapsulates an object that another member can depend on. This
 * dependency arises because the object has data that can be accessed by the user.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - An Impactor must be a Child, however the Impactor component must be installed
 * before the Child component, as the child component will use the Impactor functionality
 * when it is being initialized.
 * - An Impactor must be a DataHolder, however it must be initialized before
 * the DataHolder. An object can not be one without the other.
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



