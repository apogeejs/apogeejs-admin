import ActionError from "/apogee/lib/ActionError.js";

/** This mixin encapsulates an member whose value depends on on another
 * member. The dependent allows for a recalculation based on an update of the 
 * objects it depends on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Dependent must be a Member.
 * 
 */
let Dependent = {};
export {Dependent as default};

/** This initializes the component */
Dependent.init = function() {
    
    //this is the list of dependencies
    this.dependsOnList = [];
    this.calcPending = false;
}

/** This property tells if this object is a dependent.
 * This property should not be implemented on non-dependents. */
Dependent.isDependent = true;

/** This returns a list of the members that this member depends on. */
Dependent.getDependsOn = function() {
    return this.dependsOnList;
}

/** This returns the calc pending flag.  */
Dependent.getCalcPending = function() {
    return this.calcPending;
}

/** This sets the calc pending flag to false. It should be called when the 
 * calcultion is no longer needed.  */
Dependent.clearCalcPending = function() {
    this.calcPending = false;
}

//Must be implemented in extending object
///** This method udpates the dependencies if needed because
// *a variable was added or removed from the model.  */
//Dependent.updateDependeciesForModelChange = function(object);

///** This is a check to see if the object should be checked for dependencies 
// * for recalculation. It is safe for this method to always return false and
// allow the calculation to happen. 
// * @private */
//Dependent.needsCalculating = function();

/** This does any init needed for calculation.  */
Dependent.prepareForCalculate = function() {
    this.clearErrors();
    this.setResultPending(false);
    this.setResultInvalid(false);
    this.calcPending = true;
}

///** This updates the member based on a change in a dependency.  */
//Dependent.calculate = function();

/** This method makes sure any impactors are set. It sets a dependency 
 * error if one or more of the dependencies has a error. */
Dependent.initializeImpactors = function() {
    var errorDependencies = [];
    var resultPending = false;
    var resultInvalid = false;
    
    //make sure dependencies are up to date
    for(var i = 0; i < this.dependsOnList.length; i++) {
        var impactor = this.dependsOnList[i];
        if((impactor.isDependent)&&(impactor.getCalcPending())) {
            impactor.calculate();
        }
        if(impactor.hasError()) {
            errorDependencies.push(impactor);
        } 
        else if(impactor.getResultPending()) {
            resultPending = true;
        }
        else if(impactor.getResultInvalid()) {
            resultInvalid = true;
        }
    }

    if(errorDependencies.length > 0) {
        this.createDependencyError(errorDependencies);
    }
    else if(resultPending) {
        this.setResultPending(true,null);
    }
    else if(resultInvalid) {
        this.setResultInvalid(true);
    }
}

/** This method does any needed cleanup when the dependent is depeted.. */
Dependent.onDeleteDependent = function() {
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
Dependent.updateDependencies = function(newDependsOn) {
    
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
Dependent.createDependencyError = function(errorDependencies) {
        //dependency error found
        var message = "Error in dependency: ";
        for(var i = 0; i < errorDependencies.length; i++) {
            if(i > 0) message += ", ";
            message += errorDependencies[i].getFullName();
        }
        var actionError = new ActionError(message,"Calculation - Dependency",this);
        this.addError(actionError);   

}
