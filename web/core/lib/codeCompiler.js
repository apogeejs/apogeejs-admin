  
visicomp.core.codeCompiler = {};

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData.
 * @private */
visicomp.core.codeCompiler.processCode = function(codeInfo,
        contextManager,
        codeLabel,
        objectFunctionName) {
    
    //analyze the code
    var combinedFunctionBody = visicomp.core.codeCompiler.createCombinedFunctionBody(
        codeInfo.argList, 
        codeInfo.functionBody, 
        codeInfo.supplementalCode, 
        codeLabel,
        objectFunctionName);
        
    //get the accessed variables
    //
    //parse the code and get variabls dependencies
    var analyzeOutput = visicomp.core.codeAnalysis.analyzeCode(combinedFunctionBody);
    
    if(analyzeOutput.success) {
        codeInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        codeInfo.errors = analyzeOutput.errors;
    }

    //create the object function and context setter from the code text
    var generatorOutput = visicomp.core.codeCompiler.createObjectFunction(codeInfo.varInfo, combinedFunctionBody);
    if(generatorOutput.success) {
        codeInfo.contextSetter = generatorOutput.contextSetter;
        codeInfo.objectFunction = generatorOutput.objectFunction;
    }
    else {
        codeInfo.errors = generatorOutput.errors;
    }
    
    
    //calculate dependencies
	codeInfo.dependencyList = visicomp.core.codeDependencies.getDependencyInfo(
            codeInfo.varInfo,
            contextManager);
    
    return codeInfo;   
}


/** This method creates the user code object function body. 
 * @private */
visicomp.core.codeCompiler.createCombinedFunctionBody = function(argList,
        functionBody, 
        supplementalCode,
        codeLabel,
        functionName) {
    
    var argListString = argList.join(",");
    
    if((functionName === undefined)||(functionName === null)) {    
        functionName = "";
    }
    
    //create the code body
    var combinedFunctionBody = visicomp.core.util.formatString(
        visicomp.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT,
		codeLabel,
        functionName,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates the wrapped user code object function, including the context variables. 
 * @private */
visicomp.core.codeCompiler.createObjectFunction = function(varInfo, combinedFunctionBody) {
    
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
        contextSetterBody += baseName + ' = contextManager.getBaseData("' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = visicomp.core.util.formatString(
        visicomp.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
        
    var generatorOutput;
    try {
        var generatorFunction = new Function(generatorBody);
    
        //return the output of the generator - the object function and the context setter
        generatorOutput = generatorFunction();
        generatorOutput.success = true;
    }
    catch(exception) {
        generatorOutput = {};
        generatorOutput.success = false;
        generatorOutput.error = visicomp.core.ActionError.processException(exception,"Compile - Code",false);
    }
    
    return generatorOutput;
}


/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: functionName
 * 2: function argument list with parentheses
 * 3: member formula text
 * 4: supplemental code text
 * 
 * @private
 */
visicomp.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code",
"{4}",
"//end supplemental code",
"",
"//member function",
"returnValue.objectFunction = function {1}({2}) {",
"{3}",
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
visicomp.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT = [
"//declare context variables",
"{0}",
"",
"var returnValue = {};",
"//context setter",
"returnValue.contextSetter = function(contextManager) {",
"{1}",
"};",
"",
"//user code",
"{2}",
"",
"return returnValue;"
   ].join("\n");



