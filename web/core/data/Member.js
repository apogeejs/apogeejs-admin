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
    this.functionBody = null;
    this.supplementalCode = null;
	
    //this is a function that generates the function for this member
    this.functionGeneratorBody = null;
    this.functionGenerator = null;
    
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
    
    this.varInfo = visicomp.core.codeAnalysis.analyzeCode(this.functionGeneratorText);
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
    var newDependsOnList = visicomp.core.memberDependencies.getDependencyInfo(this.varInfo);
    this.updateDependencies(newDependsOnList);    
}

/** This method indicates if the member needs to be calculated. 
 * @private */
visicomp.core.Member.needsExecuting = function() {
	return (this.functionGenerator !== null);
}


/** This method calculates the object data from the function.  */
visicomp.core.Member.execute = function() {
    if(!this.functionGeneratorBody) return;
    
    //create the function in the proper closure
    this.functionGenerator = this.parent.createFunctionInContext(this.functionGeneratorBody);
    
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
    
    var oldDependsOn = this.dependsOnList;
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < currentDependsOn.length; i++) {
        remoteMember = newDependsOn[i].member;
		
		//update this member
		remoteMember.addToImpactsList(this);

		//create a set of new member to use below
		newDependencySet[remoteMember.getFullName()] = true;
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteMember = oldDependsOn[i].member;
		
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

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Member.clearFunction = function() {
    delete visicomp.core.functionCode[this.getWorkspace().getName()][this.getFullName()];
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
   
///** this is the code for adding the accessed member to the code
// * @private */
//visicomp.core.Member.LOCAL_ACCESSED_MEMBER_FORMAT_TEXT = 'var {0} = _localFolder.lookupChildData("{0}");\n';
//
///** this is the code for adding the accessed folder to the code
// * @private */
//visicomp.core.Member.ROOT_ACCESSED_MEMBER_FORMAT_TEXT = 'var {0} = _rootFolder.lookupChildData("{0}");\n';
    





