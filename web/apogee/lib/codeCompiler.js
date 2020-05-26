import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {KEYWORDS, EXCLUSION_NAMES, analyzeCode} from "/apogee/lib/codeAnalysis.js"; 

/** @private */
const APOGEE_FORBIDDEN_NAMES = {
    "apogeeMessenger": true,
    "__initializer": true,
    "__memberFunction": true,
    "__memberGenerator": true,
    "__memberFunctionDebugHook": true
}

/** @private */
const NAME_PATTERN = /[a-zA-Z_$][0-9a-zA-Z_$]*/;

/** This function validates a table name. It returns 
 * [valid,errorMsg]. */
export function validateTableName(name) {
    var nameResult = {};

    //check if it is a keyword
    if(KEYWORDS[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Javascript reserved keyword";
        nameResult.valid = false;
    }  
    else if(EXCLUSION_NAMES[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Javascript variable or value name";
        nameResult.valid = false;
    }
    else if(APOGEE_FORBIDDEN_NAMES[name]) {
        nameResult.errorMessage = "Illegal name: " + name + " - Apogee reserved keyword";
        nameResult.valid = false;
    }
    else {
        //check the pattern
        var nameResult = NAME_PATTERN.exec(name);
        if((!nameResult)||(nameResult[0] !== name)) {
            if(!nameResult) nameResult = {};
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
export function processCode(argList,functionBody,supplementalCode,codeLabel) {
    
    //analyze the code
    var combinedFunctionBody = createCombinedFunctionBody(argList,functionBody,supplementalCode,codeLabel);
        
    //get the accessed variables
    //
    //parse the code and get variable dependencies
    var effectiveCombinedFunctionBody = MEMBER_LOCALS_TEXT + combinedFunctionBody;
    var analyzeOutput = analyzeCode(effectiveCombinedFunctionBody);
    
    var compiledInfo = {};
    
    if(analyzeOutput.success) {
        compiledInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        compiledInfo.errors = analyzeOutput.errors;
        compiledInfo.valid = false;
        return compiledInfo;
    }

    //create and execute the generator function to get the member function generator
    //and the memberFunctionContextInitializer
    var generatorFunction = createGeneratorFunction(compiledInfo.varInfo, combinedFunctionBody);
    try {
        //get the generated fucntion
        var generatedFunctions = generatorFunction();
        compiledInfo.memberFunctionGenerator = generatedFunctions.memberGenerator;
        compiledInfo.memberFunctionContextInitializer = generatedFunctions.initializer;  
        compiledInfo.valid = true;                     
    }
    catch(ex) {
        compiledInfo.errors = [ex];
        compiledInfo.valid = false;
    }
    
    return compiledInfo;   
}


/** This method creates the user code object function body. 
 * @private */
function createCombinedFunctionBody(argList,
        functionBody, 
        supplementalCode,
        codeLabel) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = apogeeutil.formatString(
        MEMBER_FUNCTION_FORMAT_TEXT,
		codeLabel,
        argListString,
        functionBody,
        supplementalCode
    );
        
    return combinedFunctionBody;
}

/** This method creates (1) a closure function that returns another generator function
 * which makes the member function and (2) a function that initializes any external 
 * variables needed in the member function.
 * This closure wraps the variables that are external to this member, meaning other
 * members in the model.
 * This initializer function allows the code to be compiled once and then used with different
 * values for other data in the model.
 * The generator that makes the member function is a closure to wrap the member private
 * code and any other needed data with the member function.
 * @private */
function createGeneratorFunction(varInfo, combinedFunctionBody) {
    
    var contextDeclarationText = "";
    var initializerBody = "";

    //add the messenger as a local variable
    contextDeclarationText += "var apogeeMessenger\n";
    initializerBody += "apogeeMessenger = __messenger\n";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "var " + baseName + ";\n";
        
        //add to the context setter
        initializerBody += baseName + ' = __contextManager.getValue(__model,"' + baseName + '");\n';
    }
    
    //create the generator for the object function
    var generatorBody = apogeeutil.formatString(
        GENERATOR_FUNCTION_FORMAT_TEXT,
		contextDeclarationText,
        initializerBody,
        combinedFunctionBody
    );
        
    var generatorFunction = new Function(generatorBody);
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
const MEMBER_FUNCTION_FORMAT_TEXT = [
"//{0}",
"",
"//supplemental code--------------",
"{3}",
"//end supplemental code----------",
"",
"//member function----------------",
"function __memberFunction({1}) {",
"//overhead code",
"__memberFunctionDebugHook('{0}');",
"",
"//user code",
"{2}",
"};",
"//end member function------------",
   ].join("\n");
   
/** This line is added when getting the dependencies to account for some local 
 * variables in the member function.
 * @private */
const MEMBER_LOCALS_TEXT = "var apogeeMessenger, __memberFunction, __memberFunctionDebugHook;";
   
/** This is the format string to create the code body for the object function
 * Input indices:
 * 0: context declaration text
 * 1: context setter body
 * 2: object function body
 * @private
 */
const GENERATOR_FUNCTION_FORMAT_TEXT = [
"'use strict'",
"//declare context variables",
"{0}",
"//context setter",
"function __initializer(__model,__contextManager,__messenger) {",
"{1}};",
"",
"//user code",
"function __memberGenerator() {",
"{2}",
"return __memberFunction",
"}",
"return {",
"'memberGenerator': __memberGenerator,",
"'initializer': __initializer",
"};"
   ].join("\n");



