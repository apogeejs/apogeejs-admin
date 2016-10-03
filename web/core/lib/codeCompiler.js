  
hax.core.codeCompiler = {};

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData.
 * @private */
hax.core.codeCompiler.processCode = function(codeInfo,
        contextManager,
        codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = hax.core.codeCompiler.createCombinedFunctionBody(
        codeInfo.argList, 
        codeInfo.functionBody, 
        codeInfo.supplementalCode, 
        codeLabel);
        
    //get the accessed variables
    //
    //parse the code and get variabls dependencies
    var analyzeOutput = hax.core.codeAnalysis.analyzeCode(combinedFunctionBody);
    
    if(analyzeOutput.success) {
        codeInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        codeInfo.errors = analyzeOutput.errors;
        return codeInfo;
    }

    //create the object function and context setter from the code text
    var generatorFunction = hax.core.codeCompiler.createObjectFunction(codeInfo.varInfo, combinedFunctionBody);
    codeInfo.generatorFunction = generatorFunction;
    
    //calculate dependencies
	codeInfo.dependencyList = hax.core.codeDependencies.getDependencyInfo(
            codeInfo.varInfo,
            contextManager);
    
    return codeInfo;   
}


/** This method creates the user code object function body. 
 * @private */
hax.core.codeCompiler.createCombinedFunctionBody = function(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = hax.core.util.formatString(
        hax.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT,
		codeLabel,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates the wrapped user code object function, including the context variables. 
 * @private */
hax.core.codeCompiler.createObjectFunction = function(varInfo, combinedFunctionBody) {
    
    var contextDeclarationText = "";
    var contextSetterBody = "";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {
        //ignore this variable
        if(baseName == "__dh__") continue;
        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "var " + baseName + ";\n";
        
        //add to the context setter
        contextSetterBody += baseName + ' = contextManager.getBaseData("' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = hax.core.util.formatString(
        hax.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
        
    var generatorFunction = new Function("__dh__",generatorBody);
    return generatorFunction;    
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
hax.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code",
"{3}",
"//end supplemental code",
"",
"//member function",
"__dh__.setObjectFunction(function({1}) {",
"//overhead code",
"__dh__.initFunction();",
"",
"//user code",
"{2}",
"});",
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
hax.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT = [
"'use strict'",
"//declare context variables",
"{0}",
"",
"//context setter",
"__dh__.setContextSetter(function(contextManager) {",
"{1}",
"});",
"",
"//user code",
"{2}"
   ].join("\n");



