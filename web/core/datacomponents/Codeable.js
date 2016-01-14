/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a child,
 * dependant, recalculable and dataholder.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 */
visicomp.core.Codeable = {};

/** This initializes the component */
visicomp.core.Codeable.init = function(argList) {
    
    //arguments of the member function (with parentheses - we probably will change this)
    this.argList = argList;
    
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

/** This implements the "needsExecuting" method of Dependant. 
 * @private */
visicomp.core.Codeable.needsExecuting = function() {
	return (this.objectFunction != null);
}


/** This implements the "execute" method of Dependant.  */
visicomp.core.Codeable.execute = function() {
    if(!this.objectFunction) return;
    
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
}

//===================================
// Protected Functions
//===================================

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
