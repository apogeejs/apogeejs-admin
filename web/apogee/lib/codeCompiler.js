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
export function processCode(argList,functionBody,supplementalCode,memberName) {
    
    //analyze the code
    let memberFunctionName = memberName + "_mainFunction"
    var combinedFunctionBody = createCombinedFunctionBody(memberFunctionName,argList,functionBody,supplementalCode,memberName);
        
    //get the accessed variables
    //
    //parse the code and get variable dependencies
    var effectiveCombinedFunctionBody = getMemberLocalsText(memberFunctionName) + combinedFunctionBody;
    var analyzeOutput = analyzeCode(effectiveCombinedFunctionBody);
    
    var compiledInfo = {};
    
    if(analyzeOutput.success) {
        compiledInfo.varInfo = analyzeOutput.varInfo;
    }
    else {
        compiledInfo.error = analyzeOutput.error;
        compiledInfo.valid = false;
        return compiledInfo;
    }

    try {
        //create and execute the generator function to get the member function generator
        //and the memberFunctionContextInitializer
        var generatorBody = createGeneratorBody(memberFunctionName,compiledInfo.varInfo, combinedFunctionBody);
        var generatorFunction = new Function(generatorBody);

        //get the output functions
        var generatedFunctions = generatorFunction();
        compiledInfo.memberFunctionGenerator = generatedFunctions.memberGenerator;
        compiledInfo.memberFunctionContextInitializer = generatedFunctions.initializer;  
        compiledInfo.valid = true; 
        compiledInfo.generatorFunction = generatorFunction;                
    }
    catch(ex) {
        compiledInfo.error = ex;
        compiledInfo.valid = false;
    }
    
    return compiledInfo;   
}


/** This method creates the user code object function body. 
 * @private */
function createCombinedFunctionBody(memberFunctionName,
        argList,
        functionBody, 
        supplementalCode,
        memberName) {
    
    var argListString = argList.join(",");
    
    //create the code body
    var combinedFunctionBody = `//${memberName}

//user private code==============
${supplementalCode}
//end user private code==========

//member main function===========
function ${memberFunctionName}(${argListString}) {
    __memberFunctionDebugHook('${memberName}');

//user main code-----------------
${functionBody}
//end user main code-------------
}
//end member function============
`
        
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
function createGeneratorBody(memberFunctionName,varInfo, combinedFunctionBody) {
    
    var contextDeclarationText = "";
    var initializerBody = "";

    //add the messenger as a local variable
    contextDeclarationText += "var apogeeMessenger";
    initializerBody += "apogeeMessenger = __messenger";
    
    //set the context - here we only defined the variables that are actually used.
	for(var baseName in varInfo) {        
        var baseNameInfo = varInfo[baseName];
        
        //do not add context variable for local or "returnValue", which is explicitly defined
        if((baseName === "returnValue")||(baseNameInfo.isLocal)) continue;
        
        //add a declaration
        contextDeclarationText += "\nvar " + baseName + ";";
        
        //add to the context setter
        initializerBody += '\n\t' + baseName + ' = __contextManager.getValue(__model,"' + baseName + '");';
    }
    
    //create the generator for the object function
    var generatorBody = `'use strict'
//declare context variables
${contextDeclarationText}

//context setter
function __initializer(__model,__contextManager,__messenger) {
    ${initializerBody}
};

//user code
function __memberGenerator() {
${combinedFunctionBody}
return ${memberFunctionName}
}

return {
    'memberGenerator': __memberGenerator,
    'initializer': __initializer
};
`
    return generatorBody;    
}

   
/** This line is added when getting the dependencies to account for some local 
 * variables in the member function.
 * @private */
function getMemberLocalsText(memberFunctionName) {
    return `var apogeeMessenger, ${memberFunctionName}, __memberFunctionDebugHook;`
}
   



