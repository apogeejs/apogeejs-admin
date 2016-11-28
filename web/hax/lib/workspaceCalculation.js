/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
hax.calculation = {};


/** This moethod should be called on an Impactor (DataHolder) or Dependent object that changes.
 * This will allow for any Dependents to be recaculated.
 * @private */
hax.calculation.addToRecalculateList = function(recalculateList,member) {
    //if it is in the list, return
    if(recalculateList.indexOf(member) >= 0) return;
     
    //add this member to recalculate list if it needs to be executed
    if((member.isDependent)&&(member.needsCalculating())) {
        recalculateList.push(member);
        member.prepareForCalculate();
    }
    
    //add any member that depends on this one
    if(member.isDataHolder) {
        var impactsList = member.getImpactsList();
        for(var i = 0; i < impactsList.length; i++) {
            hax.calculation.addToRecalculateList(recalculateList,impactsList[i]);
        }
    }
}

/** This calls execute for each member in the recalculate list. The return value
 * is false if there are any errors.
 * @private */
hax.calculation.callRecalculateList = function(recalculateList,actionResponse) {
    var dependent;
    var i;
    var success = true;
    for(i = 0; i < recalculateList.length; i++) {
        dependent = recalculateList[i];
        if(dependent.getCalcPending()) {
            dependent.calculate();   
            if(dependent.hasError()) {
                var actionErrors = dependent.getErrors();
                if(actionErrors) {
                    for(var j = 0; j < actionErrors.length; j++) {
                        actionResponse.addError(actionErrors[j]);
                    }
                }
                success = false;
            }
        }
    }
    
    return success;
}
