/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
visicomp.core.calculation = {};


/** This addes the member to the recalculate list, if it has a formula and hence
 * needs to be recalculated. It then adds all talbes that depend on this one.
 * @private */
visicomp.core.calculation.addToRecalculateList = function(recalculateList,member) {
    //if it is in the list, return
    if(this.inList(recalculateList,member)) return;
     
    //add this member to recalculate list if it needs to be executed
    if(member.isDependent) {
        if(member.needsExecuting()) {
           recalculateList.push(member);
        }
    }
    //add any member that is depends on this one
    if(member.isImpactor) {
        var impactsList = member.getImpactsList();
        for(var i = 0; i < impactsList.length; i++) {
            visicomp.core.calculation.addToRecalculateList(recalculateList,impactsList[i]);
        }
    }
}

/** This method places the member in the recalculate list, but only if the member is 
 * not already there. 
 *  @private */
visicomp.core.calculation.inList = function(recalculateList,member) {
    for(var j = 0; j < recalculateList.length; j++) {
        var testObject = recalculateList[j];
        if(testObject == member) {
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
	var member;
	var i;
    var success = true;
	
	//keep track of which members have been copied to the sorted list
    //clear all circular reference errors before sorting (they will be reset if needed)
	var memberIsSortedMap = {};
	for(i = 0; i < recalculateList.length; i++) {
		member = recalculateList[i];
		memberIsSortedMap[member.getFullName()] = false;       
        member.clearCircRefError();
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
			member = recalculateList[i];
			
			//check if there are any unsorted dependencies
			var unsortedImpactedDependencies = false;
			var dependsOn = member.getDependsOn();
			for(var j = 0; j < dependsOn.length; j++) {
				var remoteObject = dependsOn[j];
                
                //don't withhold an object that depends on itself
                if(remoteObject === member) continue;
                
				if(memberIsSortedMap[remoteObject.getFullName()] === false) {
					//this depends on an unsorted member
					unsortedImpactedDependencies = true;
					break;
				}
			}
			
			//save member to sorted if there are no unsorted impacted dependencies
			if(!unsortedImpactedDependencies) {
				//add to the end of the sorted list
				sortedRecalculateList.push(member);
				//record that is has been sorted
				memberIsSortedMap[member.getFullName()] = true;
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
            var actionError = new visicomp.core.ActionError(errorMsg,null,visicomp.core.ActionError.ACTION_ERROR_MODEL);
            actionResponse.addError(actionError);
            for(var ie = 0; ie < recalculateList.length; ie++) {
                member = recalculateList[ie];
                member.setCircRefError(actionError);
                sortedRecalculateList.push(member);
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
    var member;
    var i;
    var overallSuccess = true;
    for(i = 0; i < recalculateList.length; i++) {
        member = recalculateList[i];

        //update the member
        var success = member.execute();
        if(!success) {
            var actionError = member.getDataError();
            if(actionError) {
                actionResponse.addError(actionError);
            }
            overallSuccess = false;
        }
    }
    
    return overallSuccess;
}









