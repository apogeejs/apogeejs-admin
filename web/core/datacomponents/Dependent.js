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

///** This is a check to see if the object should be checked for dependencies 
// * for recalculation. It is safe for this method to always return false and
// allow the calculation to happen. 
// * @private */
//visicomp.core.Dependent.needsCalculating = function();

///** This updates the member based on a change in a dependency.  */
//visicomp.core.Dependent.prepareForCalculate = function();

///** This updates the member based on a change in a dependency.  */
//visicomp.core.Dependent.calculate = function();

///** This method initializes the data for this function.  */
//visicomp.core.Dependent.initFunction = function();

/** This method makes sure any impactors are set. It sets a dependency 
 * error if one or more of the dependencies has a error. */
visicomp.core.Dependent.initializeImpactors = function() {
    var errorDependencies = [];
    
    //make sure dependencies are up to date
    for(var i = 0; i < this.dependsOnList.length; i++) {
        var impactor = this.dependsOnList[i];
        if((impactor.needsCalculating())&&(!impactor.getDataSet())) {
            impactor.calculate();
        }
        if(impactor.hasError()) {
            errorDependencies.push(impactor);
        }                   
    }

    if(errorDependencies.length > 0) {
        createDependencyError(errorDependencies);
    }
}
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
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
		
		if(!remoteMember.isDataHolder) {
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

/** This method creates an dependency error, given a list of impactors that have an error. 
 * @private */
visicomp.core.Dependent.createDependencyError = function(errorDependencies) {
        //dependency error found
        var message = "Error in dependency: ";
        for(i = 0; i < errorDependencies.length; i++) {
            if(i > 0) message += ", ";
            message += errorDependencies[i].getFullName();
        }
        var actionError = new visicomp.core.ActionError(message,"Calculation - Dependency",dependent);
        this.addError(actionError);   

}
