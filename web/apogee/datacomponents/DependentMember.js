import ActionError from "/apogee/lib/ActionError.js";
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
    constructor(model,name) {
        super(model,name);

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //this is the list of dependencies
        this.setField("dependsOnList",[]);
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
        return this.getField("dependsOnList");
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
    //updateDependeciesForModelChange(additionalUpdatedMembers);

    ///** This is a check to see if the object should be checked for dependencies 
    // * for recalculation. It is safe for this method to always return false and
    // allow the calculation to happen. 
    // * @private */
    //needsCalculating();

    /** This does any init needed for calculation.  */
    prepareForCalculate() {
        this.clearErrors();
        this.setResultPending(false);
        this.setResultInvalid(false);
        this.calcPending = true;
    }

    ///** This updates the member based on a change in a dependency.  */
    //calculate();

    /** This method makes sure any impactors are set. It sets a dependency 
     * error if one or more of the dependencies has a error. */
    initializeImpactors() {
        var errorDependencies = [];
        var resultPending = false;
        var resultInvalid = false;
        
        //make sure dependencies are up to date
        let dependsOnList = this.getField("dependsOnList");
        for(var i = 0; i < dependsOnList.length; i++) {
            var impactorId = dependsOnList[i];
            let model = this.getModel();
            let impactor = model.lookupMember(impactorId);

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
    onDeleteDependent() {
        //remove this dependent from the impactor
        let model = this.getModel();
        let dependsOnList = this.getField("dependsOnList");
        for(var i = 0; i < dependsOnList.length; i++) {
            var remoteMemberId = dependsOnList[i];
            //remove from imacts list
            model.removeFromImpactsList(this.getId(),remoteMemberId);
        }
    }
    //===================================
    // Private Functions
    //===================================

    /** This sets the dependencies based on the code for the member. */
    updateDependencies(dependsOnMemberList) {
        
        var dependenciesUpdated = false;
        let model = this.getModel();
        
        if(!dependsOnMemberList) {
            dependsOnMemberList = [];
        }
        let newDependsOnList = [];
        let oldDependsOnList = this.getField("dependsOnList");
        
        //recod the new dependencies. Check for additions
        var i;
        for(i = 0; i < dependsOnMemberList.length; i++) {
            let remoteMember = dependsOnMemberList[i];  
            let remoteMemberId = remoteMember.getId()
            newDependsOnList.push(remoteMemberId);

            //check if this is a change
            if(oldDependsOnList.indexOf(remoteMemberId) < 0) {
                model.addToImpactsList(this.getId(),remoteMemberId);
                dependenciesUpdated = true;
            }  
        }
        
        //check for removals
        for(i = 0; i < oldDependsOnList.length; i++) {
            let remoteMemberId = oldDependsOnList[i];

            if(newDependsOnList.indexOf(remoteMemberId) < 0) {
                //remove from imacts list
                model.removeFromImpactsList(this.getId(),remoteMemberId);
                dependenciesUpdated = true;
            }
        }

        this.setField("dependsOnList",newDependsOnList);
        
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
            var actionError = new ActionError(message,"Calculation - Dependency",this);
            this.addError(actionError);   

    }
}
