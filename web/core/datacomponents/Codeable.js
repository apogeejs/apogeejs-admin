/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a child,
 * dependant, recalculable and dataholder.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 */
visicomp.core.Codeable = {};

/** This initializes the component */
visicomp.core.Codeable.init = function(argParenList) {
    
    //arguments of the member function (with parentheses - we probably will change this)
    this.argParenList = argParenList;
	
    //this contains the formula and dependency information
    this.functionBody = "";
    this.supplementalCode = "";
	
    //this is a function that generates the function for this member
    this.functionGeneratorBody = null;
    this.functionGenerator = null;
	this.aliasCode = null;
    
    //this is the list of variables access in the code for this function
    this.varInfo = null;
}

/** This method returns the argument list, whith parentheses for this member.  */
visicomp.core.Codeable.getArgParensList = function() {
    return this.argParenList;
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
visicomp.core.Codeable.setCode = function(functionBody, supplementalCode) {
    this.functionBody = functionBody;
    this.supplementalCode = supplementalCode;
    
    this.createFunctionGeneratorBody();
    
    this.varInfo = visicomp.core.codeAnalysis.analyzeCode(this.functionGeneratorBody);
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.clearCode = function() {
	this.functionBody = "";
    this.supplementalCode = "";
    this.functionGeneratorBody = null;
    this.functionGenerator = null;
	this.aliasCode = null;
    this.varInfo = null;
    
    this.clearFunction();
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This method returns the formula for this member.  */
visicomp.core.Codeable.hasCode = function() {
    return (this.functionGeneratorBody !== null);
}

visicomp.core.Codeable.calculateDependencies = function() {
    //calculate the dependecies
	this.dependencyInfo = visicomp.core.memberDependencies.getDependencyInfo(this.varInfo,this.getParent(),this.getRootFolder());
	
	//set the table dependencies
    this.updateDependencies(this.dependencyInfo.accessedObjects);    
	
	//create the alias code so the proper variables are present when executing the user code
	this.createAliasCode(this.dependencyInfo.accessedNames);
}

/** This implements the "needsExecuting" method of Dependant. 
 * @private */
visicomp.core.Codeable.needsExecuting = function() {
	return (this.functionGeneratorBody != null);
}


/** This implements the "execute" method of Dependant.  */
visicomp.core.Codeable.execute = function() {
    if(!this.functionGeneratorBody) return;
	
	var rootDataMap = this.getRootFolder().getData();
    var localDataMap = this.getParent().getData();
	
    //create the function in the proper closure
    this.functionGenerator = visicomp.core.CodeableHelper.createFunctionGenerator(rootDataMap,
		localDataMap,
		this.functionGeneratorBody,
		this.aliasCode);
    
    //create the function using the generator
    //this stores the function globally so the user can debug it easily
    this.functionGenerator();
    
    var objectFunction = visicomp.core.getObjectFunction(this);
    
    if(!objectFunction) {
        alert("Object function not found!");
        return;
    }
    
    //process the object function as needed (implement for each type)
    this.processObjectFunction(objectFunction);
}

/** This method method modifies the delete call to the child object.  */
visicomp.core.Codeable.onDelete = function() {
	//clear the function
    this.clearFunction();
	
	//call the base function last (since it removes the path)
	visicomp.core.Child.onDelete.call(this);
}

//===================================
// Private Functions
//===================================



//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//visicomp.core.Codeable.processObjectFunction 


/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.Codeable.createFunctionGeneratorBody = function() {
    
    var memberFullName = this.getFullName();
    var workspaceName = this.parent.getWorkspace().getName();
    
    //create the code body
    this.functionGeneratorBody = visicomp.core.util.formatString(
        visicomp.core.Codeable.GENERATOR_FUNCTION_FORMAT_TEXT,
        workspaceName,
		memberFullName,
        this.argParenList,
        this.functionBody,
        this.supplementalCode
    );
}

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.Codeable.createAliasCode = function(accessedNameList) {
	var aliasCode = "";
	for(var i = 0; i < accessedNameList.length; i++) {
		var entry = accessedNameList[i];
		aliasCode = this.addToAliasCode(entry.baseName,entry.isLocalFolder,aliasCode);
	}

	this.aliasCode = aliasCode;
}

/** This method appends a variable alias to the alias code string. */
visicomp.core.Codeable.addToAliasCode = function(refName,isLocalReference,aliasCode) {
	if(isLocalReference) {
		aliasCode += "var " + refName + " = _localDataMap." + refName + ";\n";
	}
	else {
		aliasCode += "var " + refName + " = _rootDataMap." + refName + ";\n";
	}
	return aliasCode;
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Codeable.clearFunction = function() {
    delete visicomp.core.functionCode[this.getWorkspace().getName()][this.getFullName()];
}

visicomp.core.CodeableHelper = {};
/** This function creates the function generator with the proper table varible names
 * in the closure for the function. */
visicomp.core.CodeableHelper.createFunctionGenerator = function(_rootDataMap,
		_localDataMap,
		_functionGeneratorBody,
		_aliasCode) {
	
	//set up the local variables, which accesses the root and local data maps
	eval(_aliasCode);
	
	
//DOH! Function constructor does not use a closure switch to eval. Clean code below.
	//create the function generator, with the aliased variables in the closure
//	return new Function(_functionGeneratorBody);
	eval("var __x__ = function() {\n" + _functionGeneratorBody + "\n}");
	return __x__;
}



/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: workspace name
 * 1: unique member name
 * 2: function argument list with parentheses
 * 3: member formula text
 * 4: supplemental code text
 * @private
 */
visicomp.core.Codeable.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//{1}",
"",
"//supplemental code",
"{4}",
"//end supplemental code",
"",
"//member function",
"visicomp.core.functionCode.{0}['{1}'] = function{2} {",
"{3}",
"}",
"//end member function",
""
   ].join("\n");





