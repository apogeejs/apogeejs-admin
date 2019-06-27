/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a member and
 * dependent.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES:
 * - A Codeable must be a Member.
 * - A Codeable must be Dependent. 
 * - A Codeable must be ContextHolder
 * 
 * FIELD NAMES (from update event):
 * - argList
 * - functionBody
 * - private
 * - description
 */
apogee.Codeable = {};

/** This initializes the component. argList is the arguments for the object function. */
apogee.Codeable.init = function(argList) {
    
    //arguments of the member function
    if(argList) {
        this.argList = argList;
    }
    else {
        this.argList = [];
    }
    
    //initialze the code as empty
    this.codeSet = false;
    this.functionBody = "";
    this.supplementalCode = "";
    this.description = "";
    this.varInfo = null;
    this.dependencyInfo = null;
    this.memberFunctionInitializer = null;
    this.memberGenerator = null;
    this.codeErrors = [];
    
    this.clearCalcPending();
    this.setResultPending(false);
    this.setResultInvalid(false);
    
    //set field updated in init
    this.fieldUpdated("argList");
    this.fieldUpdated("functionBody");
    this.fieldUpdated("private");
    
    //fields used in calculation
    this.dependencyInitInProgress = false;
    this.functionInitialized = false;
    this.initReturnValue = false;
}

/** This property tells if this object is a codeable.
 * This property should not be implemented on non-codeables. */
apogee.Codeable.isCodeable = true

apogee.Codeable.getSetCodeOk = function() {
    return this.generator.setCodeOk;
}

/** This method returns the argument list.  */
apogee.Codeable.getArgList = function() {
    return this.argList;
}

/** This method returns the fucntion body for this member.  */
apogee.Codeable.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
apogee.Codeable.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method returns the supplemental code for this member.  */
apogee.Codeable.getDescription = function() {
    return this.description;
}

/** This method returns the supplemental code for this member.  */
apogee.Codeable.setDescription = function(description) {
    this.fieldUpdated("description");
    this.description = description;
}

/** This method returns the formula for this member.  */
apogee.Codeable.setCodeInfo = function(codeInfo,compiledInfo) {

    //set the base data
    if(this.argList.toString() != codeInfo.argList.toString()) {
        this.fieldUpdated("argList");
        this.argList = codeInfo.argList;
    }
    
    if(this.functionBody != codeInfo.functionBody) {
        this.fieldUpdated("functionBody");
        this.functionBody = codeInfo.functionBody;
    }
    
    if(this.supplementalCode != codeInfo.supplementalCode) {
        this.fieldUpdated("private");
        this.supplementalCode = codeInfo.supplementalCode;
    }

    //save the variables accessed
    this.varInfo = compiledInfo.varInfo;

    if((!compiledInfo.errors)||(compiledInfo.errors.length === 0)) {
        //set the code  by exectuing generator
        this.codeErrors = [];
        
        try {
            //get the inputs to the generator
            var messenger = new apogee.action.Messenger(this);
            
            //get the generated fucntion
            var generatedFunctions = compiledInfo.generatorFunction(messenger);
            this.memberGenerator = generatedFunctions.memberGenerator;
            this.memberFunctionInitializer = generatedFunctions.initializer;                       
        }
        catch(ex) {
            this.codeErrors.push(apogee.ActionError.processException(ex,"Codeable - Set Code",false));
        }
    }
    else {
//doh - i am throwing away errors - handle this differently!
        this.codeErrors = compiledInfo.errors;
    }
    
    if(this.codeErrors.length > 0) {
        //code not valid
        this.memberGenerator = null;
        this.memberFunctionInitializer = null;
    }
    this.codeSet = true;
}

/** This method returns the formula for this member.  */
apogee.Codeable.initializeDependencies = function() {
    
    if((this.hasCode())&&(this.varInfo)&&(this.codeErrors.length === 0)) {
        try {
            var newDependencyList = apogee.codeDependencies.getDependencyInfo(this.varInfo,
                   this.getContextManager());

            //update dependencies
            this.updateDependencies(newDependencyList);
        }
        catch(ex) {
            this.codeErrors.push(apogee.ActionError.processException(ex,"Codeable - Set Dependencies",false));
        }
    }
    else {
        //will not be calculated - has no dependencies
        this.updateDependencies([]);
    }
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
apogee.Codeable.updateDependeciesForModelChange = function(recalculateList) {
    if((this.hasCode())&&(this.varInfo)) {
                  
        //calculate new dependencies
        var newDependencyList = apogee.codeDependencies.getDependencyInfo(this.varInfo,
               this.getContextManager());
          
        //update the dependency list
        var dependenciesChanged = this.updateDependencies(newDependencyList);
        if(dependenciesChanged) {
            //add to update list
            apogee.calculation.addToRecalculateList(recalculateList,this);
        }  
    }
}
    
/** This method returns the formula for this member.  */
apogee.Codeable.clearCode = function() {
    this.codeSet = false;
    if(this.functionBody != "") {
        this.fieldUpdated("functionBody");
        this.functionBody = "";
    }
    if(this.supplementalCode != "") {
        this.fieldUpdated("private");
        this.supplementalCode = "";
    }
    this.varInfo = null;
    this.dependencyInfo = null;
    this.memberFunctionInitializer = null;
    this.memberGenerator = null;
    this.codeErrors = [];
    
    this.clearCalcPending();
    this.setResultPending(false);
    this.setResultInvalid(false);
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This method returns the formula for this member.  */
apogee.Codeable.hasCode = function() {
    return this.codeSet;
}

/** If this is true the member is ready to be executed. 
 * @private */
apogee.Codeable.needsCalculating = function() {
	return this.codeSet;
}

/** This does any init needed for calculation.  */
apogee.Codeable.prepareForCalculate = function() {
    //call the base function
    apogee.Dependent.prepareForCalculate.call(this);
    
    this.functionInitialized = false;
    this.initReturnValue = false;
}

/** This method sets the data object for the member.  */
apogee.Codeable.calculate = function() {
    if(this.codeErrors.length > 0) {
        this.addErrors(this.codeErrors);
        this.clearCalcPending();
        return;
    }
    
    if((!this.memberGenerator)||(!this.memberFunctionInitializer)) {
        var msg = "Function not found for member: " + this.getName();
        var actionError = new apogee.ActionError(msg,"Codeable - Calculate",this);
        this.addError(actionError);
        this.clearCalcPending();
        return;
    } 
    
    try {
        this.processMemberFunction(this.memberGenerator);
    }
    catch(error) {
        if(error == apogee.base.MEMBER_FUNCTION_INVALID_THROWABLE) {
            //This is not an error. I don't like to throw an error
            //for an expected condition, but I didn't know how else
            //to do this. See notes where this is thrown.
            this.setResultInvalid(true);
        }
        else if(error == apogee.base.MEMBER_FUNCTION_PENDING_THROWABLE) {
            //This is not an error. I don't like to throw an error
            //for an expected condition, but I didn't know how else
            //to do this. See notes where this is thrown.
            this.setResultPending(true);
        }
        //--------------------------------------
        else {
            //normal error in member function execution
        
            //this is an error in the code
            if(error.stack) {
                console.error(error.stack);
            }

            var errorMsg = (error.message) ? error.message : "Unknown error";
            var actionError = new apogee.ActionError(errorMsg,"Codeable - Calculate",this);
            actionError.setParentException(error);
            this.addError(actionError);
        }
    }
    
    this.clearCalcPending();
}

/** This makes sure user code of object function is ready to execute.  */
apogee.Codeable.memberFunctionInitialize = function() {
    
    if(this.functionInitialized) return this.initReturnValue;
    
    //make sure this in only called once
    if(this.dependencyInitInProgress) {
        var errorMsg = "Circular reference error";
        var actionError = new apogee.ActionError(errorMsg,"Codeable - Calculate",this);
        this.addError(actionError);
        //clear calc in progress flag
        this.dependencyInitInProgress = false;
        this.functionInitialized = true;
        this.initReturnValue = false;
        return this.initReturnValue;
    }
    this.dependencyInitInProgress = true;
    
    try {
        
        //make sure the data is set in each impactor
        this.initializeImpactors();
        if((this.hasError())||(this.getResultPending())||(this.getResultInvalid())) {
            this.dependencyInitInProgress = false;
            this.functionInitialized = true;
            this.initReturnValue = false;
            return this.initReturnValue;
        }
        
        //set the context
        this.memberFunctionInitializer(this.getContextManager());
        
        this.initReturnValue = true;
    }
    catch(error) {
        //this is an error in the code
        if(error.stack) {
            console.error(error.stack);
        }
        var errorMsg = (error.message) ? error.message : "Unknown error";
        var actionError = new apogee.ActionError(errorMsg,"Codeable - Calculate",this);
        actionError.setParentException(error);
        this.addError(actionError);
        this.initReturnValue = false;
    }
    
    this.dependencyInitInProgress = false;
    this.functionInitialized = true;
    return this.initReturnValue;
}

//------------------------------
// Member Methods
//------------------------------

/** This gets an update structure to upsate a newly instantiated member
/* to match the current object. */
apogee.Codeable.getUpdateData = function() {
    var updateData = {};
    if(this.hasCode()) {
        updateData.argList = this.getArgList();
        updateData.functionBody = this.getFunctionBody();
        updateData.supplementalCode = this.getSupplementalCode();
    }
    else {
        updateData.data = this.getData();
    }
    updateData.description = this.getDescription();
    return updateData;
}

//------------------------------
//ContextHolder methods
//------------------------------

/** This method retrieve creates the loaded context manager. */
apogee.Codeable.createContextManager = function() {
    return new apogee.ContextManager(this);
}

//===================================
// Private Functions
//===================================

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//apogee.Codeable.processMemberFunction 

