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
hax.Codeable = {};

/** This initializes the component. argList is the arguments for the object function. */
hax.Codeable.init = function(argList) {
    
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
    this.codeErrors = [];
    
    //fields used in calculation
    this.calcInProgress = false;
    this.dataSet = false;
    this.functionInitialized = false;
}

/** This property tells if this object is a codeable.
 * This property should not be implemented on non-codeables. */
hax.Codeable.isCodeable = true

/** This method returns the argument list.  */
hax.Codeable.getArgList = function() {
    return this.argList;
}

/** This method returns the fucntion body for this member.  */
hax.Codeable.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
hax.Codeable.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method returns the formula for this member.  */
hax.Codeable.setCodeInfo = function(codeInfo) {

    //set the base data
    this.argList = codeInfo.argList;
    this.functionBody = codeInfo.functionBody;
    this.supplementalCode = codeInfo.supplementalCode;

    //save the variables accessed
    this.varInfo = codeInfo.varInfo;

    if((!codeInfo.errors)||(codeInfo.errors.length === 0)) {
        //set the code  by exectuing generator
        try {
            codeInfo.generatorFunction(this);
            this.codeErrors = [];
        }
        catch(ex) {
            this.codeErrors.push(hax.ActionError.processException(ex,"Codeable - Set Code",false));
        }
    }
    else {
//doh - i am throwing away errors - handle this differently!
        this.codeErrors = codeInfo.errors;
    }
    
    if(this.codeErrors.length > 0) {
        //code not valid
        this.objectFunction = null;
        this.contextSetter = null;
    }
    this.codeSet = true;
    if(this.isDependent) {
        this.setDependenciesSetFlag(false);
    }
}

/** This method returns the formula for this member.  */
hax.Codeable.initializeDependencies = function() {
    
    if((this.hasCode())&&(this.varInfo)&&(this.codeErrors.length === 0)) {
        try {
            var newDependencyList = hax.codeDependencies.getDependencyInfo(this.varInfo,
                   this.getContextManager());

            //update dependencies
            this.updateDependencies(newDependencyList);
        }
        catch(ex) {
            this.codeErrors.push(hax.ActionError.processException(ex,"Codeable - Set Dependencies",false));
        }
    }
    else {
        //will not be calculated - has no dependencies
        this.updateDependencies([]);
    }
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
hax.Codeable.updateDependeciesForModelChange = function(recalculateList) {
    if((this.hasCode())&&(this.varInfo)) {
                  
        //calculate new dependencies
        var newDependencyList = hax.codeDependencies.getDependencyInfo(this.varInfo,
               this.getContextManager());
          
        //update the dependency list
        var dependenciesChanged = this.updateDependencies(newDependencyList);
        if(dependenciesChanged) {
            //add to update list
            hax.calculation.addToRecalculateList(recalculateList,this);
        }  
    }
}
    
/** This method returns the formula for this member.  */
hax.Codeable.clearCode = function() {
    this.codeSet = false;
    this.functionBody = "";
    this.supplementalCode = "";
    this.varInfo = null;
    this.dependencyInfo = null;
    this.contextSetter = null;
    this.objectFunction = null;
    this.codeErrors = [];
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This method returns the formula for this member.  */
hax.Codeable.hasCode = function() {
    return this.codeSet;
}

/** If this is true the member is ready to be executed. 
 * @private */
hax.Codeable.needsCalculating = function() {
	return (this.codeSet)&&(this.getDependenciesSetFlag());
}

/** This updates the member based on a change in a dependency.  */
hax.Codeable.prepareForCalculate = function() {
    if(this.isDataHolder) this.clearDataSet();
    this.clearErrors();
    this.functionInitialized = false;
}

/** This method sets the data object for the member.  */
hax.Codeable.calculate = function() {
    
    if(((this.isDataHolder)&&(this.getDataSet()))||(this.hasError())) return;
    
    if(this.codeErrors.length > 0) {
        this.addErrors(this.codeErrors);
        return;
    }
    
    if((!this.objectFunction)||(!this.contextSetter)) {
        var msg = "Function not found for member: " + this.getName();
        var actionError = new hax.ActionError(msg,"Codeable - Calculate",this);
        this.addError(actionError);
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
        var actionError = new hax.ActionError(errorMsg,"Codeable - Calculate",this);
        actionError.setParentException(error);
        this.addError(actionError);
    }
}

/** This makes sure user code of object function is ready to execute.  */
hax.Codeable.initFunction = function() {
    
    if(this.functionInitialized) return;
    
    //make sure this in only called once
    if(this.calcInProgress) {
        var errorMsg = "Circular reference error";
        var actionError = new hax.ActionError(errorMsg,"Codeable - Calculate",this);
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
        var actionError = new hax.ActionError(errorMsg,"Codeable - Calculate",this);
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
hax.Codeable.getUpdateData = function() {
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
hax.Codeable.createContextManager = function() {
    return new hax.ContextManager(this);
}

//===================================
// Private Functions
//===================================

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//hax.Codeable.processObjectFunction 

/** This method sets the object function. */
hax.Codeable.setObjectFunction = function(objectFunction) {
    this.objectFunction = objectFunction;
}

/** This method sets the object function. */
hax.Codeable.setContextSetter = function(contextSetter) {
    this.contextSetter = contextSetter;
}

