/** This encapsulates a member in the workspace refering to a table (data object) or a function.
 * It contains the functionality of setting code to represent the object or in setting the 
 * object directly. For code it manages dependencies to enable proper recalculation.
 * 
 * Alternatively, dependencies can be done using the events
 * fired by the objects and functions indicating they have been updated. This model
 * is used for programming controls, since this is a different programming model
 * than the scripts for the data and functions.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Member = {};

/** This initializes the component */
visicomp.core.Member.init = function() {
	
    //this contains the formula and dependency information
    this.codeInfo = null;
	
    //this is a function that generates the function for this member
    this.functionGenerator = null;
    
    //these are a list of members that depend on this member
    this.impactsList = [];
}

/** This method returns the code array. The code array
 * includees segments of code,referencing the code pattern. */
visicomp.core.Member.hasCode = function() {
    return (this.codeInfo !== null);
}

/** This method returns the code array. The code array
 * includees segments of code,referencing the code pattern. */
visicomp.core.Member.getCodeInfo = function() {
    return this.codeInfo;
}

/** This method sets the code info.*/
visicomp.core.Member.setCodeInfo = function(codeInfo) {
	//update dependencies
    var oldDependsOn = this.getDependsOn();
	
    this.codeInfo = codeInfo;
	
    var currentDependsOn = this.getDependsOn();
    this.updateDependencies(currentDependsOn, oldDependsOn);
    
    //create the function for this code info
    this.createFunction();
}

/** This method clears the code info.*/
visicomp.core.Member.clearCodeInfo = function() {
    this.codeInfo = null;
    this.clearFunction();
}

/** This returns an array of members this member impacts. */
visicomp.core.Member.getImpactsList = function() {
    return this.impactsList;
}

/** This returns a map of the members that this member depends on. */
visicomp.core.Member.getDependsOn = function() {
    if(this.codeInfo) {
        return this.codeInfo.dependsOn;
    }
    else {
        return [];
    }
}

/** This method returns the formula for this member.  */
visicomp.core.Member.getFunctionText = function() {
    var f;
    if(this.codeInfo) {
        f = this.codeInfo.functionText;
    }
    if(!f) f = "";
    return f;
}

/** This method returns the supplemental code for this member.  */
visicomp.core.Member.getSupplementalCode = function() {
    var sc;
    if(this.codeInfo) {
        sc = this.codeInfo.supplementalCode;
    }
    if(!sc) sc = "";
    return sc;
}

//===================================
// Private Functions
//===================================

/** This method indicates if the member needs to be calculated. 
 * @private */
visicomp.core.Member.needsExecuting = function() {
	return (this.functionGenerator !== null);
}

/** This method calculates the object data from the function. 
 * @private */
visicomp.core.Member.execute = function() {
    if(!this.functionGenerator) return;
    
    //create the function using the generator
    this.functionGenerator();
    
    //we store the function globally so the user can debug it easily
    var objectFunction = visicomp.core.getObjectFunction(this);
    
    if(!objectFunction) {
        alert("Object function not found!");
        return;
    }
    //process the object function as needed (implement for each type)
    this.processObjectFunction(objectFunction);
}

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//visicomp.core.Member.processObjectFunction 


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

/** This sets the dependencies based on the code for the member. 
 * @private */
visicomp.core.Member.updateDependencies = function(currentDependsOn,oldDependsOn) {
	
    //update the dependency links among the members
	var newDependencySet = {};
    var remoteMember;
    var i;
    for(i = 0; i < currentDependsOn.length; i++) {
        remoteMember = currentDependsOn[i].member;
		
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

/** This method creates the member update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.Member.createFunction = function() {
    
    var memberFullName = this.getFullName();
    var workspaceName = this.parent.getWorkspace().getName();
    
    var accessedVariableString = this.getAccessedVariableCode();

    var functionText = this.getFunctionText();
    var supplementalCode = this.getSupplementalCode();
	var functionArgumentList = "";
    
    //create the code body
    var codeBody = visicomp.core.util.formatString(
        visicomp.core.Member.MEMBER_UPDATE_FORMAT_TEXT,
        workspaceName,
		memberFullName,
        functionArgumentList,
        accessedVariableString,
        functionText,
        supplementalCode
    );
     
    //create the code command
    this.makeFunction(codeBody);
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Member.clearFunction = function() {
    delete visicomp.core.functionCode[this.getWorkspace().getName()][this.getFullName()];
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.Member.makeFunction = function(_functionText) {
	//var names are obscured because these will appear in the member function closure
	var _sourceFunction;
	var _localPackage = this.getParent();
	var _rootPackage = this.getRootPackage();
	
	//execute the code to create the source function
    eval(_functionText);
	
	//calling the generator creates the function given by the code info for this member
	this.functionGenerator = _sourceFunction;
}

/** This method creates the access variable code. It makes short cuts
 * to all the accessed members. The users should use the shortcuts and not
 * some othermethod off accessing the member because use of these shortcuts
 * determines the dependencies of the member, which is need to find the
 * member calculation order. 
 * @private */
visicomp.core.Member.getAccessedVariableCode = function() {
    
    //create the text to add an accessed member to the code
    var accessedVariableString = "";
	
	//add accessed member, either as parent or member name
    var includedNameSet = {};
	var dependsOn = this.getDependsOn();
	for(var i = 0; i < dependsOn.length; i++) {
		var varInfo = dependsOn[i];
		
		//include the variable, or the path to it, for local references
		if((varInfo.localRefBase)&&(!includedNameSet[varInfo.localRefBase])) {
           
			//add member to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.Member.LOCAL_ACCESSED_MEMBER_FORMAT_TEXT,
                varInfo.localRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
        
        //include the variable, or the path to it, for local references
		if((varInfo.rootRefBase)&&(!includedNameSet[varInfo.rootRefBase])) {
           
			//add member to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.Member.ROOT_ACCESSED_MEMBER_FORMAT_TEXT,
                varInfo.rootRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
       
	}
    
    return accessedVariableString;
}

/** This is the format string to create the code body for updateing the member
 * Input indices:
 * 0: workspace name
 * 1: unique member name
 * 2: function argument list
 * 3: access variable code text
 * 4: member formula text
 * 5: supplemental code text
 * @private
 */
visicomp.core.Member.MEMBER_UPDATE_FORMAT_TEXT = [
"   //member update code",
"   _sourceFunction = function() {",
"",
"//accessed variables",
"{3}",
"//end accessed variables",
"",
"//supplemental code",
"{5}",
"//end supplemental code",
"",
"//member function",
"visicomp.core.functionCode.{0}['{1}'] = {4}",
"//end member function",
"   }",
""
   ].join("\n");
   
/** this is the code for adding the accessed member to the code
 * @private */
visicomp.core.Member.LOCAL_ACCESSED_MEMBER_FORMAT_TEXT = 'var {0} = _localPackage.lookupChildData("{0}");\n';

/** this is the code for adding the accessed package to the code
 * @private */
visicomp.core.Member.ROOT_ACCESSED_MEMBER_FORMAT_TEXT = 'var {0} = _rootPackage.lookupChildData("{0}");\n';
    





