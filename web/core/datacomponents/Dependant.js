/** This mixin encapsulates an object in the workspace that depends on another
 * object by virtue of code (from being a Codeable) in the object. Other dependenciees are possible
 * but they are not captured buy this component.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependant must be a Child. The Child component must be installed before the
 * Dependant component.
 * - A Dependent is a Codeable, however it must be installed before Codeable. An object
 * can not be one without the other.
 */
visicomp.core.Dependant = {};

/** This initializes the component */
visicomp.core.Dependant.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
}

/** This property tells if this object is a dependant.
 * This property should not be implemented on non-dependants. */
visicomp.core.Dependant.isDependant = true;

/** This returns a map of the members that this member depends on. */
visicomp.core.Dependant.getDependsOn = function() {
    return this.dependsOnList;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was added.  */
//visicomp.core.Codeable.updateForAddedVariable = function(object);

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was deleted.  */
//visicomp.core.Codeable.updateForDeletedVariable = function(object);

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
        
        //make sure this is a dependant
        if(!remoteMember.isImpactor) {
            visicomp.core.util.createError("The object " + remoteMember.getFullName() + " cannot be referenced as a dependant.");
        }
		
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
