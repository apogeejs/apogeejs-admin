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

/** This initializes the component. argList is the arguments for the object function.
 * allowRecursive assigns the name of the variable to the function so it can call itself
 * as a local variable. We want to allow functions to call themselves but we do not
 * want the formula for a data object to call the previous value of itself. */
visicomp.core.Codeable.init = function(argList,allowRecursive) {
    
    //arguments of the member function
    this.argList = argList;
    
    //the allows the object function for this member to call itself
    this.allowRecursive = allowRecursive;
	
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

/** This method returns the formula for this member.  */
visicomp.core.Codeable.setCodeInfo = function(codeInfo) {

    //set the base data
    this.argList = codeInfo.argList;
    this.functionBody = codeInfo.functionBody;
    this.supplementalCode = codeInfo.supplementalCode;
    this.codeSet = true;

    if(codeInfo.actionError) {
        this.setCodeError(codeInfo.actionError);
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
            
        var newDependencyList;
        try {
            
            //calculate new dependencies
            newDependencyList = visicomp.core.codeDependencies.getDependencyInfo(this.varInfo,
               this.getParent(),
               this.getRootFolder());
        }
        catch(error) {
            //error for this member
            var actionError = visicomp.core.ActionError.processMemberModelException(error,this);
            this.setCodeError(actionError);
            
            //set a dummy dependency list
            newDependencyList = [];
        }
            
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
    
            try {
                //calculate dependencies
               var dependencyList = visicomp.core.codeDependencies.getDependencyInfo(this.varInfo,
                   this.getParent(),
                   this.getRootFolder());
            }
            catch(error) {
                //unknown application error
                var actionError = visicomp.core.ActionError.processMemberModelException(error,this);
                this.setCodeError(actionError);
            }

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
visicomp.core.Codeable.needsExecuting = function() {
	return this.codeSet;
}


/** This updates the member data based on the function. It returns
 * true for success and false if there is an error.  */
visicomp.core.Codeable.execute = function() {
	
	//don't calculate if this has an error.
	//do pass the error on to be a data error.
	if(this.hasCodeError()) {
		this.setDataError(this.getCodeError());
		return false;
	}
    
    if((!this.objectFunction)||(!this.contextSetter)) {
        var actionError = new visicomp.core.ActionError("Function not found for member: " + this.getName(),this);
        this.setDataError(actionError);
        return false;
    }
    
    try {
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
