/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a child,
 * dependent and dataholder.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Codeable must be a Child. The Child component must be installed before the
 * Codeable component.
 * - A Codeable is a Dependent. Dependent calculates dependencies arising from 
 * anobjects code. The Dependent component must be installed before the Codeable component. 
 * - A Codeable is a Calculable.
 */
visicomp.core.Codeable = {};

/** This initializes the component. argList is the arguments for the object function.
 * allowRecursive assigns the name of the variable to the function so it can call itself
 * as a local variable. We want to allow functions to call themselves but we do not
 * want the formula for a data object to call the previous value of itself. */
visicomp.core.Codeable.init = function(argList,allowRecursive) {
    
    //arguments of the member function
    this.argList = argList;
    
    this.contextManager = new visicomp.core.ContextManager(this.getOwner());
    
    //the allows the object function for this member to call itself
    this.allowRecursive = allowRecursive;
    
    //initialze the code as empty
    this.clearCode();
}

/** This property tells if this object is a codeable.
 * This property should not be implemented on non-codeables. */
visicomp.core.Codeable.isCodeable = true

/** This method returns the argument list.  */
visicomp.core.Codeable.getArgList = function() {
    return this.argList;
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.getAllowRecursive = function() {
    return this.allowRecursive;
}

/** This method returns the fucntion body for this member.  */
visicomp.core.Codeable.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
visicomp.core.Codeable.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method returns the contextManager for this codeable.  */
visicomp.core.Codeable.getContextManager = function() {
    return this.contextManager;
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.setCodeInfo = function(codeInfo) {

    //set the base data
    this.argList = codeInfo.argList;
    this.functionBody = codeInfo.functionBody;
    this.supplementalCode = codeInfo.supplementalCode;
    this.codeSet = true;

    if(codeInfo.actionError) {
        this.addPreCalcError(codeInfo.actionError);
    }
    else {

        //save the variables accessed
        this.varInfo = codeInfo.varInfo;

        //save the object functions
        this.contextSetter = codeInfo.contextSetter;
        this.objectFunction = codeInfo.objectFunction;

        //clear any code error
        this.codeError = null;
    }

    //update dependencies
    this.updateDependencies(codeInfo.dependencyList);
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
visicomp.core.Codeable.updateForAddedVariable = function(addedMember,recalculateList) {
    if((this.hasCode())&&(this.varInfo)) {
                  
        //calculate new dependencies
        var newDependencyList = visicomp.core.codeDependencies.getDependencyInfo(this.varInfo,
               this.contextManager);
            
        //update this object if the new table is in the list
        if(newDependencyList.indexOf(addedMember) >= 0) {
            //update dependencies
            this.updateDependencies(newDependencyList);

            //add to update list
            visicomp.core.calculation.addToRecalculateList(recalculateList,this);
        }
        
    }
}

/** This method udpates the dependencies if needed because
 *the passed variable was deleted.  */
visicomp.core.Codeable.updateForDeletedVariable = function(deletedMember,recalculateList) {
    if(this.hasCode()) {
        var dependsOnList = this.getDependsOn();
        if(dependsOnList.indexOf(deletedMember) >= 0) {
            
            if(!this.varInfo) return;
    
            var dependencyList = visicomp.core.codeDependencies.getDependencyInfo(this.varInfo,
                   this.contextManager);

            //update dependencies
            this.updateDependencies(dependencyList); 

            //add to update list
            visicomp.core.calculation.addToRecalculateList(recalculateList,this);
        }
    }
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.clearCode = function() {
    this.codeSet = false;
    this.functionBody = "";
    this.supplementalCode = "";
    this.varInfo = null;
    this.dependencyInfo = null;
    this.contextSetter = null;
    this.objectFunction = null;
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.hasCode = function() {
    return this.codeSet;
}

/** If this is true the member must be executed. 
 * @private */
visicomp.core.Codeable.needsCalculating = function() {
	return this.codeSet;
}


/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
visicomp.core.Codeable.calculate = function() {
    
    //clear these errors here. they will be reset below
    this.clearErrors("Codeable - Calculate");
    
    if((!this.objectFunction)||(!this.contextSetter)) {
        var msg = "Function not found for member: " + this.getName();
        var actionError = new visicomp.core.ActionError(msg,"Codeable - Calculate",this);
        this.addError(actionError);
        return false;
    }
    
    try {
        //set the context
        this.contextSetter(this.contextManager);

        //process the object function as needed (implement for each type)
        this.processObjectFunction(this.objectFunction);
        
        return true;
    }
    catch(error) {
        //this is an error in the code
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = "Error Recalculating Member: " + ((error.message) ? error.message : null);
        var actionError = new visicomp.core.ActionError(errorMsg,"Codeable - Calculate",this);
        actionError.setParentException(error);
        this.addError(actionError);
        return false;
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This gets an update structure to upsate a newly instantiated child
/* to match the current object. */
visicomp.core.Codeable.getUpdateData = function() {
    var updateData = {};
    if(this.hasCode()) {
        updateData.argList = this.getArgList();
        updateData.functionBody = this.getFunctionBody();
        updateData.supplementalCode = this.getSupplementalCode();
    }
    else {
        updateData.data = this.getData();
    }
    return updateData;
}

//===================================
// Private Functions
//===================================

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//visicomp.core.Codeable.processObjectFunction 

