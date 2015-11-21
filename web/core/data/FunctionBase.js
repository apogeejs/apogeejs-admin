/** This encapsulates the code and dependencies on other objects in the workspace.
 * It is used by, for example, objects with a formula and by functions.
 * 
 * Here dependencies are handled in the application so the updates can be calculated
 * in the proper order. 
 * 
 * Alternatively dependenciees can be done using the events
 * fired by the objects and functions indicating they have been updated. This model
 * is used for programming controls, since this is a different programming model
 * than the scripts for the data and functions.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.core.FunctionBase = {};




///////////////////////////////////////////////////////////////////

/** This initializes the component */
visicomp.core.FunctionBase.init = function() {
	
    //this contains the formula and dependency information
    this.codeInfo = null;
	
    //these are a list of objects that depend on this object
    this.impactsList = [];
}

visicomp.core.FunctionBase.needsExecuting = function() {
	return false;
}
visicomp.core.FunctionBase.execute = function() {}

/** This method updates the data for the object. It should be implemented by
 * the object.
 * @protected */
visicomp.core.FunctionBase.setContent = function(contentData) {}


/** This method returns the code array. The code array
 * includees segments of code,referencing the code pattern. */
visicomp.core.FunctionBase.getCodeInfo = function() {
    return this.codeInfo;
}

/** This method sets the code info.*/
visicomp.core.FunctionBase.setCodeInfo = function(codeInfo) {
	
    var oldDependsOn = this.getDependsOn();
	
    this.codeInfo = codeInfo;
	
    var currentDependsOn = this.getDependsOn();
    this.updateDependencies(currentDependsOn, oldDependsOn);
    
    if(codeInfo != null) {
        this.createFunction();
    }
    else {
        this.clearFunction();
    }
}

/** This returns an array of objects this obejct impacts. */
visicomp.core.FunctionBase.getImpactsList = function() {
    return this.impactsList;
}

/** This returns a map of the objects that this object depends on. */
visicomp.core.FunctionBase.getDependsOn = function() {
    if(this.codeInfo) {
        return this.codeInfo.dependsOn;
    }
    else {
        return [];
    }
}

/** this method adds a data object to the imapacts list for this node. */
visicomp.core.FunctionBase.addToImpactsList = function(object) {
    //exclude this object
    if(object == this) return;
	
    //make sure it appears only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == object) return;
    }
    //add to the list
    this.impactsList.push(object);
}

/** this method removes a data object from the imapacts list for this node. */
visicomp.core.FunctionBase.removeFromImpactsList = function(object) {
    //it should appear only once
    for(var i = 0; i < this.impactsList.length; i++) {
        if(this.impactsList[i] == object) {
            this.impactsList.splice(i,1);
            return;
        }
    }
}

/** This sets the dependencies based on the code for the object. 
 * @private */
visicomp.core.FunctionBase.updateDependencies = function(currentDependsOn,oldDependsOn) {
	
    //update the dependency links among the objects
	var newDependencySet = {};
    var remoteObject;
    var i;
    for(i = 0; i < currentDependsOn.length; i++) {
        remoteObject = currentDependsOn[i].object;
		
		//update this object
		remoteObject.addToImpactsList(this);

		//create a set of new object to use below
		newDependencySet[remoteObject.getFullName()] = true;
    }
	
    //update for links that have gotten deleted
    for(i = 0; i < oldDependsOn.length; i++) {
        remoteObject = oldDependsOn[i].object;
		
		var stillDependsOn = newDependencySet[remoteObject.getFullName()];
		
		if(!stillDependsOn) {
			//remove from imacts list
			remoteObject.removeFromImpactsList(this);
		}
    }
}

/** This method returns the formula for this object. 
 * @private */
visicomp.core.FunctionBase.getFunctionText = function() {
    var f;
    if(this.codeInfo) {
        f = this.codeInfo.functionText;
    }
    if(!f) f = "";
    return f;
}

/** This method returns the supplemental code for this object. 
 * @private */
visicomp.core.FunctionBase.getSupplementalCode = function() {
    var sc;
    if(this.codeInfo) {
        sc = this.codeInfo.supplementalCode;
    }
    if(!sc) sc = "";
    return sc;
}

/** This method creates the object update javascript, which will be added to the
 * html page so the user easily can run it in the debugger if needed. 
 * @private */
visicomp.core.FunctionBase.createFunction = function() {
    
    var objectFullName = this.getFullName();
    var workspaceName = this.parent.getWorkspace().getName();
    
    var accessedVariableString = this.getAccessedVariableCode();
    
    var functionText = this.getFunctionText();
    var supplementalCode = this.getSupplementalCode();
	var functionArgumentList = "";
    
    //create the code body
    var codeBody = visicomp.core.util.formatString(
        visicomp.core.FunctionBase.OBJECT_UPDATE_FORMAT_TEXT,
        workspaceName,
		objectFullName,
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
visicomp.core.FunctionBase.clearFunction = function() {
    delete visicomp.core.functionCode[this.getWorkspace().getName()][this.getFullName()];
}

/** This methoc evaluates the update command tect to make the update command.
 * It is separated so there is no context and minimal added closure variables 
 * in the eval statement. 
 * @private */
visicomp.core.FunctionBase.makeFunction = function(_functionText) {
	//var names are obscured because these will appear in the object function closure
	var _sourceFunction;
	var _localPackage = this.getParent();
	var _rootPackage = this.getRootPackage();
	
	//execute the code to create the source function
    eval(_functionText);
	
	//exectuing this function creates the function for this object
	_sourceFunction();
}

/** This method creates the access variable code. It makes short cuts
 * to all the accessed objects. The users should use the shortcuts and not
 * some othermethod off accessing the object because use of these shortcuts
 * determines the dependencies of the object, which is need to find the
 * object calculation order. 
 * @private */
visicomp.core.FunctionBase.getAccessedVariableCode = function() {
    
    //create the text to add an accessed object to the code
    var accessedVariableString = "";
	
	//add accessed object, either as parent or object name
    var includedNameSet = {};
	var dependsOn = this.getDependsOn();
	for(var i = 0; i < dependsOn.length; i++) {
		var varInfo = dependsOn[i];
		
		//include the variable, or the path to it, for local references
		if((varInfo.localRefBase)&&(!includedNameSet[varInfo.localRefBase])) {
           
			//add object to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.FunctionBase.LOCAL_ACCESSED_OBJECT_FORMAT_TEXT,
                varInfo.localRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
        
        //include the variable, or the path to it, for local references
		if((varInfo.rootRefBase)&&(!includedNameSet[varInfo.rootRefBase])) {
           
			//add object to access variables
			accessedVariableString += visicomp.core.util.formatString(
                visicomp.core.FunctionBase.ROOT_ACCESSED_OBJECT_FORMAT_TEXT,
                varInfo.rootRefBase
            );
              
            //store that we included this name
            includedNameSet[varInfo.localRefBase] = true;
		}
       
	}
    
    return accessedVariableString;
}

/** This is the format string to create the code body for updateing the object
 * Input indices:
 * 0: workspace name
 * 1: unique object name
 * 2: function argument list
 * 3: access variable code text
 * 4: object formula text
 * 5: supplemental code text
 */
visicomp.core.FunctionBase.OBJECT_UPDATE_FORMAT_TEXT = [
"   //object update code",
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
"//object function",
"visicomp.core.functionCode.{0}['{1}'] = {4}",
"//end object function",
"   }",
""
   ].join("\n");
   
//this is the code for adding the accessed object to the code
visicomp.core.FunctionBase.LOCAL_ACCESSED_OBJECT_FORMAT_TEXT = 'var {0} = _localPackage.lookupChildData("{0}");\n';

//this is the code for adding the accessed package to the code
visicomp.core.FunctionBase.ROOT_ACCESSED_OBJECT_FORMAT_TEXT = 'var {0} = _rootPackage.lookupChildData("{0}");\n';
    





