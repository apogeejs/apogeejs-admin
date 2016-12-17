  
hax.codeCompiler = {};

/** @private */
hax.codeCompiler.HAX_FORBIDDEN_NAMES = {
    "root": true
}

/** @private */
hax.codeCompiler.NAME_PATTERN = /[a-zA-Z_$][0-9a-zA-Z_$]*/;

/** This function validates a table name. It returns 
 * [valid,errorMsg]. */
hax.codeCompiler.validateTableName = function(name) {
    var nameResult = {};

    //check if it is a keyword
    if(hax.codeAnalysis.KEYWORDS[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Javascript reserved keyword";
        nameResult.valid = false;
    }    
    else if(hax.codeCompiler.HAX_FORBIDDEN_NAMES[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Hax reserved keyword";
        nameResult.valid = false;
    }
    else {
        //check the pattern
        var nameResult = hax.codeCompiler.NAME_PATTERN.exec(name);
        if((!nameResult)||(nameResult[0] !== name)) {
            nameResult.errorMessage = "Illegal name format: " + name;
            nameResult.valid = false;
        }
        else {
            nameResult.valid = true;
        }
    }
    return nameResult;
}

/** This method analyzes the code and creates the object function and dependencies. 
 * The results are loaded into the passed object processedCodeData. */
hax.codeCompiler.processCode = function(codeInfo,codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = hax.codeCompiler.createCombinedFunctionBody(
        codeInfo.argList, 
        codeInfo.functionBody, 
        codeInfo.supplementalCode, 
        codeLabel);
        
    //get the accessed variables
    //
    //parse the code and get variable dependencies
    var effectiveCombinedFunctionBody = hax.codeCompiler.MEMBER_LOCALS_TEXT + combinedFunctionBody;
    var analyzeOutput = hax.codeAnalysis.analyzeCode(effectiveCombinedFunctionBody);
    
    if(analyzeOutput.success) {
        codeInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        codeInfo.errors = analyzeOutput.errors;
        return codeInfo;
    }

    //create the object function and context setter from the code text
    var generatorFunction = hax.codeCompiler.createGeneratorFunction(codeInfo.varInfo, combinedFunctionBody);
    codeInfo.generatorFunction = generatorFunction;
    
    return codeInfo;   
}


/** This method creates the user code object function body. 
 * @private */
hax.codeCompiler.createCombinedFunctionBody = function(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = hax.util.formatString(
        hax.codeCompiler.MEMBER_FUNCTION_FORMAT_TEXT,
		codeLabel,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates the wrapped user code object function, including the context variables. 
 * @private */
hax.codeCompiler.createGeneratorFunction = function(varInfo, combinedFunctionBody) {
    
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
    var generatorBody = hax.util.formatString(
        hax.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        contextSetterBody,
        combinedFunctionBody
    );
        
    var generatorFunction = new Function("__initFunction",generatorBody);
    return generatorFunction;    
}


/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: unique member name
 * 1: function argument list with parentheses
 * 2: member formula text
 * 3: supplemental code text
 * 
 * @private
 */
hax.codeCompiler.MEMBER_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code--------------",
"{3}",
"//end supplemental code----------",
"",
"//member function----------------",
"function __memberFunction({1}) {",
"//overhead code",
"__initFunction();",
"",
"//user code",
"{2}",
"};",
"//end member function------------",
   ].join("\n");
   
/** This line is added when getting the dependencies to account for some local 
 * variables in the member function.
 * @private */
hax.codeCompiler.MEMBER_LOCALS_TEXT = "var __initFunction, __memberFunction; " 
   
/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: context declaration text
 * 1: context setter body
 * 2: object function body
 * @private
 */
hax.codeCompiler.GENERATOR_FUNCTION_FORMAT_TEXT = [
"'use strict'",
"//declare context variables",
"{0}",
"//context setter",
"function __setContext(contextManager) {",
"{1}};",
"",
"//user code",
"{2}",
"return {",
"'memberFunction': __memberFunction,",
"'contextSetter': __setContext",
"};"
   ].join("\n");



