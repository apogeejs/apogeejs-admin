/** This encapsulates a member in the workspace refering to a table (data object) or a function.
 * It contains the functionality of setting code to represent the object or in setting the 
 * object directly. For code it manages dependencies to enable proper recalculation.
 * 
 * Alternatively, dependencies can be done using the events
 * fired by the objects and functions indicating they have been updated. This model
 * is used for programming controls, since this is a different programming model
 * than the scripts for the data and functions.
 * 
 * Objects have this member component should also have the child component, as the member
 * extends the child.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Member = {};

/** This initializes the component */
visicomp.core.Member.init = function(argParenList) {
    
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
    
    //this is the list of dependencies
    this.dependsOnList = [];
    
    //these are a list of members that depend on this member
    this.impactsList = [];
}

/** This method returns the formula for this member.  */
visicomp.core.Member.getFunctionBody = function() {
    return this.functionBody;
}

/** This method returns the supplemental code for this member.  */
visicomp.core.Member.getSupplementalCode = function() {
    return this.supplementalCode;
}

/** This method returns the formula for this member.  */
visicomp.core.Member.setCode = function(functionBody, supplementalCode) {
    this.functionBody = functionBody;
    this.supplementalCode = supplementalCode;
    
    this.createFunctionGeneratorBody();
    
    this.varInfo = visicomp.core.codeAnalysis.analyzeCode(this.functionGeneratorBody);
}

/** This method returns the formula for this member.  */
visicomp.core.Member.clearCode = function() {
	this.functionBody = "";
    this.supplementalCode = "";
    this.functionGeneratorBody = null;
    this.functionGenerator = null;
	this.aliasCode = null;
    this.varInfo = null;
    
    var newDependsOn = [];
	this.updateDependencies(newDependsOn);
}

/** This returns an array of members this member impacts. */
visicomp.core.Member.getImpactsList = function() {
    return this.impactsList;
}

/** This returns a map of the members that this member depends on. */
visicomp.core.Member.getDependsOn = function() {
    return this.dependsOnList;
}

visicomp.core.Member.calculateDependencies = function() {
    //calculate the dependecies
	this.dependencyInfo = visicomp.core.memberDependencies.getDependencyInfo(this.varInfo,this.getParent(),this.getRootFolder());
	
	//set the table dependencies
    this.updateDependencies(this.dependencyInfo.accessedObjects);    
	
	//create the alias code so the proper variables are present when executing the user code
	this.createAliasCode(this.dependencyInfo.accessedNames);
}

/** This method indicates if the member needs to be calculated. 
 * @private */
visicomp.core.Member.needsExecuting = function() {
	return (this.functionGeneratorBody != null);
}


/** This method calculates the object data from the function.  */
visicomp.core.Member.execute = function() {
    if(!this.functionGeneratorBody) return;
	
	var rootDataMap = this.getRootFolder().getData();
    var localDataMap = this.getParent().getData();
	
    //create the function in the proper closure
    this.functionGenerator = visicomp.core.MemberHelper.createFunctionGenerator(rootDataMap,
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

/** This method returns the supplemental code for this member.  */
visicomp.core.Member.onDelete = function() {
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
//visicomp.core.Member.processObjectFunction 


/** This sets the dependencies based on the code for the member. 
 * @private */
visicomp.core.Member.updateDependencies = function(newDependsOn) {
	//retireve the old list
    var oldDependsOn = this.dependsOnList;
	
    //create the new dependency list
	this.dependsOnList = newDependsOn;
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < newDependsOn.length; i++) {
        remoteMember = newDependsOn[i];
		
		//update this member
		remoteMember.addToImpactsList(this);

		//create a set of new member to use below
		newDependencySet[remoteMember.getFullName()] = true;
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteMember = oldDependsOn[i];
		
		var stillDependsOn = newDependencySet[remoteMember.getFullName()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteMember.removeFromImpactsList(this);
		}
    }
}

/** This method adds a data member to the imapacts list for this node. 
 * @private */
visicomp.core.Member.addToImpactsList = function(member) {
    //exclude this member
    if(member == this) return;
	
    //make sure it appears only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) return;
    }
    //add to the list
    this.impactsList.push(member);
}

/** This method removes a data member from the imapacts list for this node. 
 * @private */
visicomp.core.Member.removeFromImpactsList = function(member) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == member) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.Member.createFunctionGeneratorBody = function() {
    
    var memberFullName = this.getFullName();
    var workspaceName = this.parent.getWorkspace().getName();
    
    //create the code body
    this.functionGeneratorBody = visicomp.core.util.formatString(
        visicomp.core.Member.GENERATOR_FUNCTION_FORMAT_TEXT,
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
visicomp.core.Member.createAliasCode = function(accessedNameList) {
	var aliasCode = "";
	for(var i = 0; i < accessedNameList.length; i++) {
		var entry = accessedNameList[i];
		aliasCode = this.addToAliasCode(entry.baseName,entry.isLocalFolder,aliasCode);
	}

	this.aliasCode = aliasCode;
}

/** This method appends a variable alias to the alias code string. */
visicomp.core.Member.addToAliasCode = function(refName,isLocalReference,aliasCode) {
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
visicomp.core.Member.clearFunction = function() {
    delete visicomp.core.functionCode[this.getWorkspace().getName()][this.getFullName()];
}

visicomp.core.MemberHelper = {};
/** This function creates the function generator with the proper table varible names
 * in the closure for the function. */
visicomp.core.MemberHelper.createFunctionGenerator = function(_rootDataMap,
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
visicomp.core.Member.GENERATOR_FUNCTION_FORMAT_TEXT = [
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





