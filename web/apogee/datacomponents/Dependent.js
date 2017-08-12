/** This mixin encapsulates an object in the workspace that depends on another
 * object. The dependent allows for a recalculation based on an update of the 
 * objects it depends on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependent must be a Member.
 * 
 */
apogee.Dependent = {};

/** This initializes the component */
apogee.Dependent.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
    this.calcPending = false;
}

/** This property tells if this object is a dependent.
 * This property should not be implemented on non-dependents. */
apogee.Dependent.isDependent = true;

/** This returns a list of the members that this member depends on. */
apogee.Dependent.getDependsOn = function() {
    return this.dependsOnList;
}

/** This returns the calc pending flag.  */
apogee.Dependent.getCalcPending = function() {
    return this.calcPending;
}

/** This sets the calc pending flag to false. It should be called when the 
 * calcultion is no longer needed.  */
apogee.Dependent.clearCalcPending = function() {
    this.calcPending = false;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *a variable was added or removed from the workspace.  */
//apogee.Dependent.updateDependeciesForModelChange = function(object);

///** This is a check to see if the object should be checked for dependencies 
// * for recalculation. It is safe for this method to always return false and
// allow the calculation to happen. 
// * @private */
//apogee.Dependent.needsCalculating = function();

/** This does any init needed for calculation.  */
apogee.Dependent.prepareForCalculate = function() {
    this.clearErrors();
    this.setResultPending(false);
    this.calcPending = true;
}

///** This updates the member based on a change in a dependency.  */
//apogee.Dependent.calculate = function();

/** This method makes sure any impactors are set. It sets a dependency 
 * error if one or more of the dependencies has a error. */
apogee.Dependent.initializeImpactors = function() {
    var errorDependencies = [];
    var resultPending = false;
    
    //make sure dependencies are up to date
    for(var i = 0; i < this.dependsOnList.length; i++) {
        var impactor = this.dependsOnList[i];
        if(impactor.getCalcPending()) {
            impactor.calculate();
        }
        if(impactor.hasError()) {
            errorDependencies.push(impactor);
        } 
        else if(impactor.getResultPending()) {
            resultPending = true;
        }
    }

    if(errorDependencies.length > 0) {
        this.createDependencyError(errorDependencies);
    }
    else if(resultPending) {
        this.setResultPending(true,apogee.action.DEPENDENT_PENDING_TOKEN);
    }
}

/** This method does any needed cleanup when the dependent is depeted.. */
apogee.Dependent.onDeleteDependent = function() {
    //remove this dependent from the impactor
    for(var i = 0; i < this.dependsOnList.length; i++) {
        var remoteMember = this.dependsOnList[i];
        //remove from imacts list
        remoteMember.removeFromImpactsList(this);
    }
}
//===================================
// Private Functions
//===================================

/** This sets the dependencies based on the code for the member. */
apogee.Dependent.updateDependencies = function(newDependsOn) {
    
    var dependenciesUpdated = false;
    
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
			
        this.dependsOnList.push(remoteMember);

        //update this member
        var isNewAddition = remoteMember.addToImpactsList(this);
        if(isNewAddition) {
            dependenciesUpdated = true;
        }

        //create a set of new member to use below
        newDependencySet[remoteMember.getId()] = true;
		
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteMember = oldDependsOn[i];
		
		var stillDependsOn = newDependencySet[remoteMember.getId()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteMember.removeFromImpactsList(this);
            dependenciesUpdated = true;
		}
    }
//    this.dependenciesSet = true;
    
    return dependenciesUpdated;
}

/** This method creates an dependency error, given a list of impactors that have an error. 
 * @private */
apogee.Dependent.createDependencyError = function(errorDependencies) {
        //dependency error found
        var message = "Error in dependency: ";
        for(var i = 0; i < errorDependencies.length; i++) {
            if(i > 0) message += ", ";
            message += errorDependencies[i].getFullName();
        }
        var actionError = new apogee.ActionError(message,"Calculation - Dependency",this);
        this.addError(actionError);   

}
