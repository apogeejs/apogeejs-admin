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

/** This method returns the argument list.  */
visicomp.core.Codeable.getArgList = function() {
    return this.argList;
}

/** This method sets the argument list, which should be an array of strings.  */
visicomp.core.Codeable.setArgList = function(argList) {
    
    //process the user code
    var processedCodeData = {};
    this.processCode(argList,this.functionBody,this.supplementalCode,processedCodeData);
    
    //set data
    this.argList = argList;
    
    this.varInfo = processedCodeData.varInfo;
    
    this.contextSetter = processedCodeData.contextSetter;
    this.objectFunction = processedCodeData.objectFunction;
    
    //update dependencies
    this.updateDependencies(processedCodeData.dependencyList);
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
    
    //process the user code
    var processedCodeData = {};
    this.processCode(this.argList,functionBody,supplementalCode,processedCodeData);
    
    //set data
    this.functionBody = functionBody;
    this.supplementalCode = supplementalCode;
    
    this.varInfo = processedCodeData.varInfo;
    
    this.contextSetter = processedCodeData.contextSetter;
    this.objectFunction = processedCodeData.objectFunction;
    
    //update dependencies
    this.updateDependencies(processedCodeData.dependencyList); 
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
// Private Functions
//===================================

//implementations must implement this function
//This method takes the object function generated from code and processes it
//to set the data for the object. (protected)
//visicomp.core.Codeable.processObjectFunction 

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData.
 * @private */
visicomp.core.Codeable.processCode = function(argList,functionBody,supplementalCode,processedCodeData) {
    //analyze the code
    var combinedFunctionBody = this.createCombinedFunctionBody(argList, functionBody, supplementalCode);
    var varInfo = visicomp.core.codeAnalysis.analyzeCode(combinedFunctionBody);
    
    //create the object function and context setter
    this.createObjectFunction(varInfo, combinedFunctionBody, processedCodeData);
    
    //calculate dependencies
	var dependencyList = visicomp.core.memberDependencies.getDependencyInfo(varInfo,this.getParent(),this.getRootFolder());
    
    processedCodeData.varInfo = varInfo;
    processedCodeData.dependencyList = dependencyList;
}


/** This method creates the user code object function body. 
 * @private */
visicomp.core.Codeable.createCombinedFunctionBody = function(argList, functionBody, supplementalCode) {
    
    var memberFullName = this.getFullName();
    var argListString = argList.join(","); 
    
    //create the code body
    var combinedFunctionBody = visicomp.core.util.formatString(
        visicomp.core.Codeable.OBJECT_FUNCTION_FORMAT_TEXT,
		memberFullName,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates the wrapped user code object function, including the context variables. 
 * @private */
visicomp.core.Codeable.createObjectFunction = function(varInfo, combinedFunctionBody, processedCodeData) {
    
    var contextDeclarationText = "";
    var contextSetterBody = "";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {
        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "var " + baseName + ";\n";
        
        //add to the context setter
        contextSetterBody += baseName + ' = visicomp.core.Codeable.loadFromContext(listOfContexts,"' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = visicomp.core.util.formatString(
        visicomp.core.Codeable.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
    var generatorFunction = new Function(generatorBody);
    
    //return the output of the generator - the object function and the context setter
    var generatorOutput = generatorFunction();

    //save the output to the processed data struct
    processedCodeData.contextSetter = generatorOutput.contextSetter;
    processedCodeData.objectFunction = generatorOutput.objectFunction;
}

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
        
//this really should go somewhere else
var workspace = this.getWorkspace();
workspace.dispatchEvent(visicomp.core.updatemember.MEMBER_UPDATED_EVENT,this); 
//-------------------------------------
        
    }
}

/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: function argument list with parentheses
 * 2: member formula text
 * 3: supplemental code text
 * @private
 */
visicomp.core.Codeable.OBJECT_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code",
"{3}",
"//end supplemental code",
"",
"//member function",
"returnValue.objectFunction = function({1}) {",
"{2}",
"}",
"//end member function",
""
   ].join("\n");
   
/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: context declaration text
 * 1: context setter body
 * 2: object function body
 * @private
 */
visicomp.core.Codeable.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//declare context variables",
"{0}",
"",
"var returnValue = {};",
"//context setter",
"returnValue.contextSetter = function(listOfContexts) {",
"{1}",
"};",
"",
"//user code",
"{2}",
"",
"return returnValue;"
   ].join("\n");

