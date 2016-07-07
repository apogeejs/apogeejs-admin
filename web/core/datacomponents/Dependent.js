/** This mixin encapsulates an object in the workspace that depends on another
 * object. The dependent allows for a recalculation based on an update of the 
 * objects it depends on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependent must be a Child.
 * 
 */
visicomp.core.Dependent = {};

/** This initializes the component */
visicomp.core.Dependent.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
    
    //errors before calculation is attempted
    this.preCalcErrors = [];
}

/** This property tells if this object is a dependent.
 * This property should not be implemented on non-dependents. */
visicomp.core.Dependent.isDependent = true;

/** This returns a list of the members that this member depends on. */
visicomp.core.Dependent.getDependsOn = function() {
    return this.dependsOnList;
}


/** This method sets the pre calc error for this dependent. */
visicomp.core.Dependent.addPreCalcError = function(preCalcError) {
    this.preCalcErrors.push(preCalcError);
}

/** This method clears the pre calc error of a given type. It no type is set
 * all errors are cleared.*/
visicomp.core.Dependent.clearPreCalcErrors = function(type) {
    var newList = [];
    if(type != null) {    
        for(var i = 0; i < this.preCalcErrors.length; i++) {
            var error = this.preCalcErrors[i];
            if(error.getType() != type) {
                newList.push(error);
            }
        }
    }
    this.preCalcErrors = newList;
}

/** This returns true if there is a pre calc error. */
visicomp.core.Dependent.hasPreCalcError = function() {
    return (this.preCalcErrors.length > 0);
}

/** This returns the pre calc error. */
visicomp.core.Dependent.getPreCalcErrors = function() {
    return this.preCalcErrors;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was added.  */
//visicomp.core.Dependent.updateForAddedVariable = function(object);

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *the passed variable was deleted.  */
//visicomp.core.Dependent.updateForDeletedVariable = function(object);

///** This is a check to see if the object should be checked for dependencies 
// * for recalculation. It is safe for this method to always return false and
// allow the calculation to happen. 
// * @private */
//visicomp.core.Dependent.needsCalculating = function();

///** This updates the member based on a change in a dependency.  */
//visicomp.core.Dependent.calculate = function();

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
        
    this.clearPreCalcErrors("Dependent - Self Ref");
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
		
		if(remoteMember === this) {
			//it is an error to depend on itself (it doesn't exist yet)
			//ok to reference through a local varible - this is how recursive functions are handled.
			var message = "A data formula should not reference its own name.";
			var actionError = new visicomp.core.ActionError(message,"Dependent - Self Ref",this);
			this.addPreCalcError(actionError);
		}
        else if(!remoteMember.isDataHolder) {
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
