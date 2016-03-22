/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.calculation = {};


/** This moethod should be called on an Impactor (DataHolder) or Dependent object that changes.
 * This will allow for any Dependents to be recaculated.
 * @private */
visicomp.core.calculation.addToRecalculateList = function(recalculateList,member) {
    //if it is in the list, return
    if(this.inList(recalculateList,member)) return;
     
    //add this member to recalculate list if it needs to be executed
    if((member.isDependent)&&(member.needsCalculating())) {
        recalculateList.push(member);
    }
    
    //add any member that depends on this one
    if(member.isDataHolder) {
        var impactsList = member.getImpactsList();
        for(var i = 0; i < impactsList.length; i++) {
            visicomp.core.calculation.addToRecalculateList(recalculateList,impactsList[i]);
        }
    }
}

/** This method places the dependent member in the recalculate list, but only if the member is 
 * not already there. 
 *  @private */
visicomp.core.calculation.inList = function(recalculateList,dependent) {
    for(var j = 0; j < recalculateList.length; j++) {
        var testObject = recalculateList[j];
        if(testObject == dependent) {
            return true;
        }
    }
    return false;
}

/** This method updates the recalculate list order so no member appears in the list
 *before a member it depends on. This will return false if there is a circular reference.
 * @private */
visicomp.core.calculation.sortRecalculateList = function(recalculateList,actionResponse) {
	
	//working variables
	var sortedRecalculateList = [];
	var dependent;
	var i;
    var success = true;
	
	//keep track of which members have been copied to the sorted list
    //clear all circular reference errors before sorting (they will be reset if needed)
	var memberIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		dependent = recalculateList[i];
		memberIsSortedMap[dependent.getFullName()] = false;       
        dependent.clearPreCalcErrors("Calculation - Circ Ref");
	}
	
	//sort the list
	while(recalculateList.length > 0) {
		//this is to check if we did anything this iteration
		var membersAddedToSorted = false;
		
		//cycle through the member list. A member can be copied to the sorted
		//list once it has no dependencies that have not yet been copied, or in 
		//other words, it has no depedencies that have not been updated yet.
		for(i = 0; i < recalculateList.length; i++) {
			//cyucle through members
			dependent = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = dependent.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteObject = dependsOn[j];
                
                //don't withhold an object that depends on itself
                if(remoteObject === dependent) continue;
                
				if(memberIsSortedMap[remoteObject.getFullName()] === false) {
					//this depends on an unsorted member
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save member to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(dependent);
				//record that is has been sorted
				memberIsSortedMap[dependent.getFullName()] = true;
				//remove it from unsorted list
				recalculateList.splice(i,1);
				//flag that we moved a member this iteration of while loop
				membersAddedToSorted = true;
			}
		}
		
		//if we added no members to sorted this iteration, there must be a circular reference
        //give each an error and transfer to sorted list
		if(!membersAddedToSorted) {
            var errorMsg = "Circular Reference";
            var actionError = new visicomp.core.ActionError(errorMsg,"Calculation - Circ Ref",null);
            actionResponse.addError(actionError);
            for(var ie = 0; ie < recalculateList.length; ie++) {
                dependent = recalculateList[ie];
                dependent.addPreCalcError(actionError);
                sortedRecalculateList.push(dependent);
            }
            recalculateList.splice(0,recalculateList.length);
            success = false;
		}
	}
	
	//copy working sorted list back to input list member
	for(i = 0; i < sortedRecalculateList.length; i++) {
		recalculateList.push(sortedRecalculateList[i]);
	}
    
    return success;
}

/** This calls execute for each member in the recalculate list. The return value
 * is false if there are any errors.
 * @private */
visicomp.core.calculation.callRecalculateList = function(recalculateList,actionResponse) {
    var dependent;
    var i;
    var overallSuccess = true;
    for(i = 0; i < recalculateList.length; i++) {
        dependent = recalculateList[i];
        
        //check for errors related to dependency
        var success;
        if(dependent.hasPreCalcError()) {
            dependent.addErrors(dependent.getPreCalcErrors());
            success = false;
        }
        else {
            //check if any values this depends on have an error
            var errorFound = visicomp.core.calculation.checkDependencyError(dependent);
            success = !errorFound;
            
            if(success) {
                //update the member
                success = dependent.calculate();
            }
        }
        
        if(!success) {
            var actionErrors = dependent.getErrors();
            if(actionErrors) {
                for(var j = 0; j < actionErrors.length; j++) {
                    actionResponse.addError(actionErrors[j]);
                }
            }
            overallSuccess = false;
        }
    }
    
    return overallSuccess;
}


/** This method checks if any variable the given member depends on has an error. If so it 
 * reports an error for this member and returns true.  Otherwise it returns false.
 * @private */
visicomp.core.calculation.checkDependencyError = function(dependent) {
    
    dependent.clearErrors("Calculation - Dependency");
    
    //get variables this depends on has an error
    var dependsOn = dependent.getDependsOn();
    var errorDependencies = null;
    var i = 0;
    for(var i = 0; i < dependsOn.length; i++) {
        var impactor = dependsOn[i];
        if(impactor.hasError()) {
			//this depends on a table with an error.
            if(errorDependencies == null) {
                errorDependencies = [];
            }
            errorDependencies.push(dependent);
        }
    }
    
    if(errorDependencies != null) {
        //dependency error found
        var message = "Error in dependency: ";
        for(i = 0; i < errorDependencies.length; i++) {
            if(i > 0) message += ", ";
            message += errorDependencies[i].getFullName();
        }
        var actionError = new visicomp.core.ActionError(message,"Calculation - Dependency",dependent);
        dependent.addError(actionError);   
        
        return true;
    }
    else {
        //no dependency error
        return false;
    }
}










