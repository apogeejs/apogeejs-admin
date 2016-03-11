/** This mixin encapsulates an object in the workspace that depends on another
 * object, and is recalculated based partialy on that object.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependent must be a Child. The Child component must be installed before the
 * Dependent component.
 * 
 */
visicomp.core.Dependent = {};

/** This initializes the component */
visicomp.core.Dependent.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
}

/** This property tells if this object is a dependent.
 * This property should not be implemented on non-dependents. */
visicomp.core.Dependent.isDependent = true;

/** This returns a list of the members that this member depends on. */
visicomp.core.Dependent.getDependsOn = function() {
    return this.dependsOnList;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was added.  */
//visicomp.core.Dependent.updateForAddedVariable = function(object);

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was deleted.  */
//visicomp.core.Dependent.updateForDeletedVariable = function(object);

//===================================
// Private Functions
//===================================

/** This sets the dependencies based on the code for the member. */
visicomp.core.Dependent.updateDependencies = function(newDependsOn) {
    
    if(!newDependsOn) {
        newDependsOn = [];
    }
    
	//retireve the old list
    var oldDependsOn = this.dependsOnList;
	
    //create the new dependency list
	this.dependsOnList = [];

//-----------------------
//ARGH - this is ugly. Figure out how to put errors on all dependents
//A dependent non-calculable is one that has forwards dependencies, but doesn't depend on them
//itself, like a folder
    if(this.isCalculable) {
        this.clearPreCalcErrors("Dependent - Self Ref");
    }
//------------------------
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
		
		if((remoteMember === this)&&(this.isCalculable)) {
//-----------------------
//ARGH - this is ugly. Figure out how to put errors on all dependents
			//it is an error to depend on itself (it doesn't exist yet)
			//ok to reference through a local varible - this is how recursive functions are handled.
			var message = "A data formula should not reference its own name.";
			var actionError = new visicomp.core.ActionError(message,"Dependent - Self Ref",this);
			this.addPreCaclError(actionError);
//------------------------
		}
        else if(!remoteMember.isImpactor) {
            //PLACE A WARNING HERE!!!
        }
		else {	
			
			this.dependsOnList.push(remoteMember);
			
			//update this member
			remoteMember.addToImpactsList(this);

			//create a set of new member to use below
			newDependencySet[remoteMember.getFullName()] = true;
		}
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
