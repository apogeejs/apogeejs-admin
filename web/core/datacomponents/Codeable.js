/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a child,
 * dependent and dataholder.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Codeable must be a Child.
 * - A Codeable must be Dependent. 
 * - A Codeable must be ContextHolder
 */
hax.core.Codeable = {};

/** This initializes the component. argList is the arguments for the object function.
 * dataEvaluatesObjectFunction is used to determine if the object function for this
 * codeable can be set before the context and impactors are initialized. */
hax.core.Codeable.init = function(argList,dataEvaluatesObjectFunction) {
    
    //arguments of the member function
    this.argList = argList;
    
    //initialze the code as empty
    this.codeSet = false;
    this.functionBody = "";
    this.supplementalCode = "";
    this.varInfo = null;
    this.dependencyInfo = null;
    this.contextSetter = null;
    this.objectFunction = null;
    this.codeError = null;
    
    //fields used in calculation
    this.calcInProgress = false;
    this.dataSet = false;
    this.functionInitialized = false;
}

/** This property tells if this object is a codeable.
 * This property should not be implemented on non-codeables. */
hax.core.Codeable.isCodeable = true

/** This method returns the argument list.  */
hax.core.Codeable.getArgList = function() {
    return this.argList;
}

/** This method returns the fucntion body for this member.  */
hax.core.Codeable.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
hax.core.Codeable.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method returns the formula for this member.  */
hax.core.Codeable.setCodeInfo = function(codeInfo) {

    //set the base data
    this.argList = codeInfo.argList;
    this.functionBody = codeInfo.functionBody;
    this.supplementalCode = codeInfo.supplementalCode;

    //save the variables accessed
    this.varInfo = codeInfo.varInfo;

    if(codeInfo.actionError == null) {
        //set the code  by exectuing generator
        try {
            codeInfo.generatorFunction(this);
            this.codeError = null;
            
            //update dependencies
            this.updateDependencies(codeInfo.dependencyList);
        }
        catch(ex) {
            this.codeError = hax.core.ActionError.processException(ex,"Codeable - Set Code",false);
        }
    }
    else {
        this.codeError = codeInfo.actionError;
    }
    
    if(codeInfo.actionError) {
        //code not valid
        this.objectFunction = null;
        this.contextSetter = null;
        //will not be calculated - hasnot dependencies
        this.updateDependecies([]);
    }
    
    this.codeSet = true; 
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
hax.core.Codeable.updateForAddedVariable = function(addedMember,recalculateList) {
    if((this.hasCode())&&(this.varInfo)) {
                  
        //calculate new dependencies
        var newDependencyList = hax.core.codeDependencies.getDependencyInfo(this.varInfo,
               this.getContextManager());
            
        //update this object if the new table is in the list
        if(newDependencyList.indexOf(addedMember) >= 0) {
            //update dependencies
            this.updateDependencies(newDependencyList);

            //add to update list
            hax.core.calculation.addToRecalculateList(recalculateList,this);
        }
        
    }
}

/** This method udpates the dependencies if needed because
 *the passed variable was deleted.  */
hax.core.Codeable.updateForDeletedVariable = function(deletedMember,recalculateList) {
    if(this.hasCode()) {
        var dependsOnList = this.getDependsOn();
        if(dependsOnList.indexOf(deletedMember) >= 0) {
            
            if(!this.varInfo) return;
    
            var dependencyList = hax.core.codeDependencies.getDependencyInfo(this.varInfo,
                   this.getContextManager());

            //update dependencies
            this.updateDependencies(dependencyList); 

            //add to update list
            hax.core.calculation.addToRecalculateList(recalculateList,this);
        }
    }
}

/** This method returns the formula for this member.  */
hax.core.Codeable.clearCode = function() {
    this.codeSet = false;
    this.functionBody = "";
    this.supplementalCode = "";
    this.varInfo = null;
    this.dependencyInfo = null;
    this.contextSetter = null;
    this.objectFunction = null;
    this.codeError = null;
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This method returns the formula for this member.  */
hax.core.Codeable.hasCode = function() {
    return this.codeSet;
}

/** If this is true the member must be executed. 
 * @private */
hax.core.Codeable.needsCalculating = function() {
	return this.codeSet;
}

/** This updates the member based on a change in a dependency.  */
hax.core.Codeable.prepareForCalculate = function() {
    if(this.isDataHolder) this.clearDataSet();
    this.clearErrors();
    this.functionInitialized = false;
}

/** This method sets the data object for the member.  */
hax.core.Codeable.calculate = function() {
    
    if(((this.isDataHolder)&&(this.getDataSet()))||(this.hasError())) return;
    
    if((!this.objectFunction)||(!this.contextSetter)) {
        var msg = "Function not found for member: " + this.getName();
        var actionError = new hax.core.ActionError(msg,"Codeable - Calculate",this);
        this.addError(actionError);
        return;
    }
    
    if(this.codeError != null) {
        this.addError(this.codeError);
        return;
    }
    
    try {
        this.processObjectFunction(this.objectFunction);
    }
    catch(error) {
        //this is an error in the code
        if(error.stack) {
            console.error(error.stack);
        }

        var errorMsg = (error.message) ? error.message : "Unknown error";
        var actionError = new hax.core.ActionError(errorMsg,"Codeable - Calculate",this);
        actionError.setParentException(error);
        this.addError(actionError);
    }
}

/** This makes sure user code of object function is ready to execute.  */
hax.core.Codeable.initFunction = function() {
    
    if(this.functionInitialized) return;
    
    //make sure this in only called once
    if(this.calcInProgress) {
        var errorMsg = "Circular reference error";
        var actionError = new hax.core.ActionError(errorMsg,"Codeable - Calculate",this);
        this.addError(actionError);
        //clear calc in progress flag
        this.calcInProgress = false;
        return;
    }
    this.calcInProgress = true;
    
    try {
        
        //make sure the data is set in each impactor
        this.initializeImpactors();
        if(this.hasError()) {
            this.calcInProgress = false;
            return;
        }
        
        //set the context
        this.contextSetter(this.getContextManager());
    }
    catch(error) {
        //this is an error in the code
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = (error.message) ? error.message : "Unknown error";
        var actionError = new hax.core.ActionError(errorMsg,"Codeable - Calculate",this);
        actionError.setParentException(error);
        this.addError(actionError);
    }
    
    this.calcInProgress = false;
    this.functionInitialized = true;
}

//------------------------------
// Child Methods
//------------------------------

/** This gets an update structure to upsate a newly instantiated child
/* to match the current object. */
hax.core.Codeable.getUpdateData = function() {
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

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
hax.core.Codeable.createContextManager = function() {
    return new hax.core.ContextManager(this.getOwner());
}

//===================================
// Private Functions
//===================================

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//hax.core.Codeable.processObjectFunction 

/** This method sets the object function. */
hax.core.Codeable.setObjectFunction = function(objectFunction) {
    this.objectFunction = objectFunction;
}

/** This method sets the object function. */
hax.core.Codeable.setContextSetter = function(contextSetter) {
    this.contextSetter = contextSetter;
}

