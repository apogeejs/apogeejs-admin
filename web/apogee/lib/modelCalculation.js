/** This module contains functions to process an update to an member
 * which inherits from the FunctionBase component. */


/** This moethod should be called on an member (impactor or dependent) that changes.
 * This will allow for any Dependents to be recaculated. */
export function addToRecalculateList(recalculateList,member) {
    //if it is in the list, return
    if(recalculateList.indexOf(member) >= 0) return;
     
    //add this member to recalculate list if it needs to be executed
    if((member.isDependent)&&(member.needsCalculating())) {
        recalculateList.push(member);
        member.prepareForCalculate();
    }
        
    addDependsOnToRecalculateList(recalculateList,member);
}

export function addDependsOnToRecalculateList(recalculateList,member) {
    //add any member that depends on this one 
    let model = member.getModel();   
    var impactsList = model.getImpactsList(member);
    for(var i = 0; i < impactsList.length; i++) {
        let impactor = model.lookupMember(impactsList[i]);
        addToRecalculateList(recalculateList,impactor);
    }
}



/** This calls execute for each member in the recalculate list. The return value
 * is false if there are any errors. */
export function callRecalculateList(recalculateList) {
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
