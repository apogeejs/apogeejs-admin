/** This namespace contains functions to process an update to an member
 * which inherits from the FunctionBase component. */
apogee.calculation = {};


/** This moethod should be called on an member (impactor or dependent) that changes.
 * This will allow for any Dependents to be recaculated.
 * @private */
apogee.calculation.addToRecalculateList = function(recalculateList,member) {
    //if it is in the list, return
    if(recalculateList.indexOf(member) >= 0) return;
     
    //add this member to recalculate list if it needs to be executed
    if((member.isDependent)&&(member.needsCalculating())) {
        recalculateList.push(member);
        member.prepareForCalculate();
    }
        
    apogee.calculation.addDependsOnToRecalculateList(recalculateList,member);
}

apogee.calculation.addDependsOnToRecalculateList = function(recalculateList,member) {
    //add any member that depends on this one    
    var impactsList = member.getImpactsList();
    for(var i = 0; i < impactsList.length; i++) {
        apogee.calculation.addToRecalculateList(recalculateList,impactsList[i]);
    }
}



/** This calls execute for each member in the recalculate list. The return value
 * is false if there are any errors.
 * @private */
apogee.calculation.callRecalculateList = function(recalculateList) {
    var dependent;
    var i;
    var success = true;
    for(i = 0; i < recalculateList.length; i++) {
        dependent = recalculateList[i];
        if(dependent.getCalcPending()) {
            dependent.calculate();   
        }
    }
    
    return success;
}
