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
 */
visicomp.core.Codeable = {};

/** This initializes the component */
visicomp.core.Codeable.init = function(argList) {
    
    //arguments of the member function (with parentheses - we probably will change this)
    this.argList = argList;
	
	//error data
	this.codeError = null;
    this.circRefError = null;
    
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
visicomp.core.Codeable.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
visicomp.core.Codeable.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method sets the code error flag for this codeable, and it sets an error
 * message. The error is cleared by setting valid code. If an object has a code error
 * this will be passed on to be a data error when the member is executed.*/
visicomp.core.Codeable.setCodeError = function(actionError) {
    this.codeError = actionError;
}

/** This method returns true if there is an code error for this member, 
 * making the code invalid. */
visicomp.core.Codeable.hasCodeError = function() {
    return (this.codeError != null);
}

/** This returns the code error. */
visicomp.core.Codeable.getCodeError = function() {
    return this.codeError;
}

/** This method sets the circular reference error for this codeable.
 * If an object has a ciruclar refernec error
 * this will be passed on to be a data error when the member is executed.*/
visicomp.core.Codeable.setCircRefError = function(circRefError) {
    this.circRefError = circRefError;
}

/** This method clears the circular reference error for this codeable.*/
visicomp.core.Codeable.clearCircRefError = function() {
    this.circRefError = null;
}

/** This returns true if there is a ciruclar reference error. */
visicomp.core.Codeable.hasCircRefError = function() {
    return (this.circRefError != null);
}

/** This returns the cirular reference error. */
visicomp.core.Codeable.getCircRefError = function() {
    return this.circRefError;
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.setCodeInfo = function(codeInfo) {

        //set the base data
        this.argList = codeInfo.argList;
        this.functionBody = codeInfo.functionBody;
        this.supplementalCode = codeInfo.supplementalCode;

        //save the variables accessed
        this.varInfo = codeInfo.varInfo;

        //save the object functions
        this.contextSetter = codeInfo.contextSetter;
        this.objectFunction = codeInfo.objectFunction;
		
		//clear any code error
		this.codeError = null;

        //update dependencies
        this.updateDependencies(codeInfo.dependencyList);
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
visicomp.core.Codeable.updateForAddedVariable = function(object) {
    if(this.hasCode()) {
        //we need a function that calculates the dependencies
        //for now I will just always recalculate, if there is 
        var possibleDependency = true;
        if(possibleDependency) {
            this.recalculateDependencies();
        }
    }
}

/** This method udpates the dependencies if needed because
 *the passed variable was deleted.  */
visicomp.core.Codeable.updateForDeletedVariable = function(object) {
    if(this.hasCode()) {
        var dependsOnList = this.getDependsOn();
        if(dependsOnList.indexOf(object) >= 0) {
            this.recalculateDependencies();
        }
    }
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.clearCode = function() {
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
    return (this.objectFunction !== null);
}

/** If this is true the member must be executed. 
 * @private */
visicomp.core.Codeable.needsExecuting = function() {
	return (this.objectFunction != null);
}


/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
visicomp.core.Codeable.execute = function() {
    if(!this.objectFunction) return false;
	
	//don't calculate if this has an error.
	//do pass the error on to be a data error.
	if(this.hasCodeError()) {
		this.setDataError(this.getCodeError());
		return false;
	}
    else if(this.hasCircRefError()) {
        this.setDataError(this.getCircRefError());
        return false;
    }
    
    try {
        //check if any values this depends on have an error
        var errorFound = this.checkDependencyError();
        if(errorFound) return false;
        
        //set the context
        var rootDataMap = this.getRootFolder().getData();
        var localDataMap = this.getParent().getData();
        var listOfContexts = [
            localDataMap,
            rootDataMap,
            window
        ]
        this.contextSetter(listOfContexts);

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
        var actionError = new visicomp.core.ActionError(errorMsg,this);
        actionError.setParentException(error);
        this.setDataError(actionError);
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

/** This method returns a value by name from a list of contexts. 
 * @private */
visicomp.core.Codeable.loadFromContext = function(listOfContexts,name) {
    var cnt = listOfContexts.length;
    for(var i = 0; i < cnt; i++) {
        var map = listOfContexts[i];
        var value= map[name];
        if(value !== undefined) {
            return value;
        }
    }
    //not found
    return undefined;
}

/** This method checks if any variable this depends on ha an error. If so it 
 * reports an error for this member and returns true.  Otherwise it returns false.
 * @private */
visicomp.core.Codeable.checkDependencyError = function() {
    //get variables this depends on has an error
    var dependsOn = this.getDependsOn();
    var errorDependencies = null;
    var i = 0;
    for(var i = 0; i < dependsOn.length; i++) {
        var member = dependsOn[i];
        if(member.hasDataError()) {
			//this depends on a table with an error.
            if(errorDependencies == null) {
                errorDependencies = [];
            }
            errorDependencies.push(member);
        }
    }
    
    if(errorDependencies != null) {
        //dependency error found
        var message = "Error in dependency: ";
        for(i = 0; i < errorDependencies.length; i++) {
            if(i > 0) message += ", ";
            message += errorDependencies[i].getFullName();
        }
        var actionError = new visicomp.core.ActionError(message,this);
        actionError.setDependencyError(true);
        this.setDataError(actionError);   
        
        return true;
    }
    else {
        //no dependency error
        return false;
    }
}

/** This method recalculates the dependencies for this object, given a change
 * in variables in the workspace. 
 * @private */
visicomp.core.Codeable.recalculateDependencies = function() {
     //calculate dependencies
	var dependencyList = visicomp.core.memberDependencies.getDependencyInfo(this.varInfo,
        this.getParent(),
        this.getRootFolder());
    
    //update dependencies
    this.updateDependencies(dependencyList); 
    
    //reexecute, if needed
    if(this.needsExecuting()) {
        this.execute();
    }
}
