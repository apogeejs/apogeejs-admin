  
visicomp.core.codeCompiler = {};

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData.
 * @private */
visicomp.core.codeCompiler.processCode = function(codeInfo,
        localFolder,
        rootFolder,
        codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = visicomp.core.codeCompiler.createCombinedFunctionBody(
        codeInfo.argList, 
        codeInfo.functionBody, 
        codeInfo.supplementalCode, 
        codeLabel);
        
    //get the accessed variables
    codeInfo.varInfo = visicomp.core.codeAnalysis.analyzeCode(combinedFunctionBody);
    
    //create the object function and context setter
    var generatorOutput = visicomp.core.codeCompiler.createObjectFunction(codeInfo.varInfo, combinedFunctionBody);
    codeInfo.contextSetter = generatorOutput.contextSetter;
    codeInfo.objectFunction = generatorOutput.objectFunction;
    
    //calculate dependencies
	codeInfo.dependencyList = visicomp.core.memberDependencies.getDependencyInfo(
            codeInfo.varInfo,
            localFolder,
            rootFolder);
    
    return codeInfo;   
}


/** This method creates the user code object function body. 
 * @private */
visicomp.core.codeCompiler.createCombinedFunctionBody = function(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(","); 
    
    //create the code body
    var combinedFunctionBody = visicomp.core.util.formatString(
        visicomp.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT,
		codeLabel,
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
        contextSetterBody += baseName + ' = visicomp.core.Codeable.loadFromContext(listOfContexts,"' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = visicomp.core.util.formatString(
        visicomp.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
    var generatorFunction = new Function(generatorBody);
    
    //return the output of the generator - the object function and the context setter
    var generatorOutput = generatorFunction();
    
    return generatorOutput;
}


/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: function argument list with parentheses
 * 2: member formula text
 * 3: supplemental code text
 * @private
 */
visicomp.core.codeCompiler.OBJECT_FUNCTION_FORMAT_TEXT = [
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
visicomp.core.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT = [
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



