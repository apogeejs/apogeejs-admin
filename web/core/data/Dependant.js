/** This mixin encapsulates an object in the workspace that depends on another object or
 * id depended on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Dependant = {};

/** This initializes the component */
visicomp.core.Dependant.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
    
    //these are a list of members that depend on this member
    this.impactsList = [];
}


/** This returns an array of members this member impacts. */
visicomp.core.Dependant.getImpactsList = function() {
    return this.impactsList;
}

/** This returns a map of the members that this member depends on. */
visicomp.core.Dependant.getDependsOn = function() {
    return this.dependsOnList;
}

/** This method indicates if the member needs to be calculated.
 * It should be implemented in inheriting objects. 
 * */
//visicomp.core.Dependant.needsExecuting = function() {}


/** This method updates an object after its dependencies have been updated.
 * It should be implemented by inheriting objects.  */
//visicomp.core.Dependant.execute = function() {}

//===================================
// Private Functions
//===================================

/** This sets the dependencies based on the code for the member. 
 * @private */
visicomp.core.Dependant.updateDependencies = function(newDependsOn) {
	//retireve the old list
    var oldDependsOn = this.dependsOnList;
	
    //create the new dependency list
	this.dependsOnList = newDependsOn;
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
		
		//update this member
		remoteMember.addToImpactsList(this);

		//create a set of new member to use below
		newDependencySet[remoteMember.getFullName()] = true;
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteMember = oldDependsOn[i];
		
		var stillDependsOn = newDependencySet[remoteMember.getFullName()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteMember.removeFromImpactsList(this);
		}
    }
}

/** This method adds a data member to the imapacts list for this node. 
 * @private */
visicomp.core.Dependant.addToImpactsList = function(member) {
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
visicomp.core.Dependant.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}
