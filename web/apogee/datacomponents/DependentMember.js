import Member from "/apogee/datacomponents/Member.js";

/** This mixin encapsulates an member whose value depends on on another
 * member. The dependent allows for a recalculation based on an update of the 
 * objects it depends on.
 * 
 * This is a mixin and not a class. It is used for the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * 
 */
export default class DependentMember extends Member {

    /** This initializes the component */
    constructor(name,owner) {
        super(name,owner);

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //this is the list of dependencies
        this.setField("dependsOnMap",{});
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //WORKING FIELDS
        this.calcPending = false;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    }

    /** This property tells if this object is a dependent.
     * This property should not be implemented on non-dependents. */
    get isDependent() {
        return true;
    }

    /** This returns a list of the members that this member depends on. */
    getDependsOn() {
        return this.getField("dependsOnMap");
    }

    /** This returns the calc pending flag.  */
    getCalcPending() {
        return this.calcPending;
    }

    /** This sets the calc pending flag to false. It should be called when the 
     * calcultion is no longer needed.  */
    clearCalcPending() {
        this.calcPending = false;
    }

    //Must be implemented in extending object
    ///** This method udpates the dependencies if needed because
    // *a variable was added or removed from the model. Any member that has its dependencies udpated
    // * should be added to the additionalUpdatedObjects list. */
    //updateDependeciesForModelChange(model,additionalUpdatedMembers);

    ///** This is a check to see if the object should be checked for dependencies 
    // * for recalculation. It is safe for this method to always return false and
    // allow the calculation to happen. 
    // * @private */
    //memberUsesRecalculation();

    /** This does any init needed for calculation.  */
    prepareForCalculate() {
        this.calcPending = true;
        //clear any errors, and other state info
        this.clearState();
    }

    ///** This updates the member based on a change in a dependency.  */
    //calculate(model);

    /** This method makes sure any impactors are set. It sets a dependency 
     * error if one or more of the dependencies has a error. */
    initializeImpactors(model) {
        var errorDependencies = [];
        var resultPending = false;
        var resultInvalid = false;
        
        //make sure dependencies are up to date
        let dependsOnMap = this.getField("dependsOnMap");
        for(var idString in dependsOnMap) {
            let dependsOnType = dependsOnMap[idString];
            let impactor = model.lookupMember(idString);

            if((impactor.isDependent)&&(impactor.getCalcPending())) {
                impactor.calculate(model);
            }

            //inherit the the state of the impactor only if it is a normal dependency, as oppose to a pass through dependency
            if(dependsOnType == apogeeutil.NORMAL_DEPENDENCY) {
                let impactorState = impactor.getState();
                if(impactorState == apogeeutil.STATE_ERROR) {
                    errorDependencies.push(impactor);
                } 
                else if(impactorState == apogeeutil.STATE_PENDING) {
                    resultPending = true;
                }
                else if(impactorState == apogeeutil.STATE_INVALID) {
                    resultInvalid = true;
                }
            }
        }

        if(errorDependencies.length > 0) {
            this.createDependencyError(errorDependencies);
        }
        else if(resultPending) {
            this.setResultPending();
        }
        else if(resultInvalid) {
            this.setResultInvalid();
        }
    }

    /** This method does any needed cleanup when the dependent is depeted.. */
    onDeleteDependent(model) {
        //remove this dependent from the impactor
        let dependsOnMap = this.getField("dependsOnMap");
        for(var remoteMemberIdString in dependsOnMap) {
            //remove from imacts list
            model.removeFromImpactsList(this.getId(),remoteMemberIdString);
        }
    }
    //===================================
    // Private Functions
    //===================================

    /** This sets the dependencies based on the code for the member. */
    updateDependencies(model,newDependsOnMap) {
        let dependenciesUpdated = false;

        let oldDependsOnMap = this.getField("dependsOnMap");
        for(var idString in newDependsOnMap) {
            if(newDependsOnMap[idString] != oldDependsOnMap[idString]) {
                dependenciesUpdated = true;
                if(!oldDependsOnMap[idString]) model.addToImpactsList(this.getId(),idString);
            }
        }
        for(var idString in oldDependsOnMap) {
            if(newDependsOnMap[idString] != oldDependsOnMap[idString]) {
                dependenciesUpdated = true;
                if(!oldDependsOnMap[idString]) model.removeFromImpactsList(this.getId(),idString);
            }
        }

        if(dependenciesUpdated) {
            this.setField("dependsOnMap",newDependsOnMap);
            this.calcPending = true;
        }

        return dependenciesUpdated;
    }

    /** This method creates an dependency error, given a list of impactors that have an error. 
     * @private */
    createDependencyError(errorDependencies) {
            //dependency error found
            var message = "Error in dependency: ";
            for(var i = 0; i < errorDependencies.length; i++) {
                if(i > 0) message += ", ";
                message += errorDependencies[i].getFullName();
            }
            this.setError(message);   
    }
}
