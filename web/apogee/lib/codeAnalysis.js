/** This function parses the code and returns a table that gives the variable use
 * in the passed function. The var info table has the following content
 * - it is a map with an entry for each variable accessed. (This refers just to
 * a variable and not to field access on that variable.
 * - the key for an entry is the name of the variable
 * - for each entry there is an array of usages. Each usage as the following info:
 * -- nameUse.path: an array of names constructing the field accessed.
   -- nameUse.scope: a reference to a scope object
   -- nameUse.node: the AST node that identifies this variable
   -- nameUse.isLocal: true if this is a reference to a local variable
   -- nameUse.decalredScope: for local variables only, gives the scope in which the lcoal variable is declared.
 * - additionally, there is a flag indicating if all uses of a name are local variables
 * -- isLocal: true if all uses of a varaible entry are local variables
 **/ 

apogee.codeAnalysis = {};

/** Syntax for AST, names from Esprima.
 * Each entry is a list of nodes inside a node of a given type. the list
 * contains entries with the given fields:
 * {
 *     name:[the name of the field in the node]
 *     list:[true if the field is a list of nodes]
 *     declaration:[boolean indicating if the field corrsponds to a field declaration]
 * @private */
apogee.codeAnalysis.syntax = {
    AssignmentExpression: [{name:'left'},{name:'right'}],
    ArrayExpression: [{name:'elements',list:true}],
    ArrowFunctionExpression: [{name:'params',list:true,declaration:true},{name:'body'},{name:'defaults',list:true}],
    BlockStatement: [{name:'body',list:true}],
    BinaryExpression: [
        {name:'left'},
        {name:'right'}
        //I'm not sure I know all of these. Some may modify the object but we will skip that check here
    ],         
    BreakStatement: [],
    CallExpression: [{name:'callee'},{name:'arguments',list:true}],
    CatchClause: [
        {name:'param',declaration:true},
        {name:'body'}
        //guards omitted - moz specific
    ],
    ConditionalExpression: [{name:'test'},{name:'alternate'},{name:'consequent'}],
    ContinueStatement: [],
    DoWhileStatement: [{name:'body'},{name:'test',list:true}],
    EmptyStatement: [],
    ExpressionStatement: [{name:'expression'}],
    ForStatement: [{name:'init'},{name:'test'},{name:'update',list:true},{name:'body'}],
    ForOfStatement: [{name:'left'},{name:'right'},{name:'body'}],
    ForInStatement: [{name:'left'},{name:'right'},{name:'body'}],
    FunctionDeclaration: [
        {name:'id',declaration:true},
        {name:'params',list:true,declaration:true},
        {name:'body'}
        //no supporting default functions values
    ],
    FunctionExpression: [
        {name:'id',declaration:true},
        {name:'params',list:true,declaration:true},
        {name:'body'}
        //no supporting default functions values
    ],
    Identifier: [], //this is handled specially
    IfStatement: [{name:'test'},{name:'consequent'},{name:'alternate'}],
    Literal: [],
    LabeledStatement: [{name:'body'}],
    LogicalExpression: [{name:'left'},{name:'right'}],
    MemberExpression: [], //this handled specially
    NewExpression: [{name:'callee'},{name:'arguments',list:true}],
    Program: [{name:'body',list:true}],
    Property: [{name:'key'},{name:'value'}], //this is handled specially
    ReturnStatement: [{name:'argument'}],
    SequenceExpression: [{name:'expressions',list:true}],
    ObjectExpression: [{name:'properties',list:true}], //this is handled specially  
    SwitchCase: [{name:'test'},{name:'consequent',list:true}],
    SwitchStatement: [{name:'discriminant'},{name:'cases',list:true}],
    TemplateElement: [],
    TemplateLiteral: [{name:'quasis',list:true},{name:'expressions',list:true}],
    ThisExpression: [],
    ThrowStatement: [{name:'argument'}],
    TryStatement: [
        {name:'block'},
        {name:'handler'},
        {name:'finalizer',list:true}
        //guards omitted, moz specific
    ],
    UnaryExpression: [
        {name:'argument'}
        //the delete operator modifies, but we will skip that error check here
        //"-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
    ],
    UpdateExpression: [{identifierNode:'argument'}],
    VariableDeclaration: [{name:'declarations',list:true,declaration:true}],
    VariableDeclarator: [{name:'id',declaration:true},{name:'init'}],
    WhileStatement: [{name:'body'},{name:'test',list:true}],
    WithStatement: [{name:'object'},{name:'body'}],
    YieldExpression: [
        {name:'argument'}
        //moz spidermonkey specific
    ],

    //no support
    ArrayPattern: null,
    AssignmentPattern: null,
    ClassBody: null,
    ClassDeclaration: null,
    ClassExpression: null,
    DebuggerStatement: null,
    ExportAllDeclaration: null,
    ExportDefaultDeclaration: null,
    ExportNamedDeclaration: null,
    ExportSpecifier: null,
    ImportDeclaration: null,
    ImportDefaultSpecifier: null,
    ImportNamespaceSpecifier: null,
    ImportSpecifier: null,
    MetaProperty: null,
    MethodDefinition: null,
    ObjectPattern: null,
    RestElement: null,
    SpreadElement: null,
    Super: null,
    TaggedTemplateExpression: null
    
};

/** These are javascript keywords */
apogee.codeAnalysis.KEYWORDS = {
	"abstract": true,
	"arguments": true,
	"boolean": true,
	"break": true,
	"byte": true,
	"case": true,
	"catch": true,
	"char": true,
	"class": true,
	"const": true,
	"continue": true,
	"debugger": true,
	"default": true,
	"delete": true,
	"do": true,
	"double": true,
	"else": true,
	"enum": true,
	"eval": true,
	"export": true,
	"extends": true,
	"false": true,
	"final": true,
	"finally": true,
	"float": true,
	"for": true,
	"function": true,
	"goto": true,
	"if": true,
	"implements": true,
	"import": true,
	"in": true,
	"instanceof": true,
	"int": true,
	"interface": true,
	"let": true,
	"long": true,
	"native": true,
	"new": true,
	"null": true,
	"package": true,
	"private": true,
	"protected": true,
	"public": true,
	"return": true,
	"short": true,
	"static": true,
	"super": true,
	"switch": true,
	"synchronized": true,
	"this": true,
	"throw": true,
	"throws": true,
	"transient": true,
	"true": true,
	"try": true,
	"typeof": true,
	"var": true,
	"void": true,
	"volatile": true,
	"while": true,
	"with": true,
	"yield": true,
};

/** These are variable names we will not call out in setting the context.
 * NOTE - it is OK if we do not exclude a global variable. It will still work. */
apogee.codeAnalysis.EXCLUSION_NAMES = {
    "undefined": true,
    "Infinity": true,
    "NaN": true,
    
    "String": true,
    "Number": true,
    "Math": true,
    "Date": true,
    "Array": true,
    "Boolean": true,
    "Error": true,
    "RegExp": true,
    
    "console": true
}

////////////////////////////////////////////////////////////////////////////////
/** This method returns the error list for this formula. It is only valid
 * after a failed call to analyzeCode. 
 *
 *  Error format: (some fields may not be present)
 *  {
 *      "description":String, //A human readable description of the error
 *      "lineNumber":Integer, //line of error, with line 0 being the function declaration, and line 1 being the start of the formula
 *      "index":Integer, //the character number of the error, including the function declaration:  "function() {\n" 
 *      "column":Integer, //the column of the error
 *      "stack":String, //an error stack
 *  }
 * */
////////////////////////////////////////////////////////////////////////////////

/** This method parses the code and returns a list of variabls accessed. It throws
 * an exception if there is an error parsing.
 **/
apogee.codeAnalysis.analyzeCode = function(functionText) {
    
    try {
        var returnValue = {};
        var ast = esprima.parse(functionText, { tolerant: true, loc: true });
    
        //check for errors in parsing
        if((ast.errors)&&(ast.errors.length > 0)) {
            returnValue.success = false;
            returnValue.errors = [];
            for(var i = 0; i < ast.errors.length; i++) {
                var astError = ast.errors[i];
                var actionError = new apogee.ActionError(astError.description,"Analyze - Code");
                actionError.setParentException(astError);
                returnValue.errors.push(actionError);
            }
        }
        
        //get the variable list
        var varInfo = apogee.codeAnalysis.getVariableInfo(ast);

        //return the variable info
        returnValue.success = true;
        returnValue.varInfo = varInfo;
        return returnValue;
    }
    catch(exception) {
        var actionError = apogee.ActionError.processException(exception,"Analyze - Code",false);
        returnValue.success = false;
        returnValue.errors = [];
        returnValue.errors.push(actionError);
        return returnValue;
    }
}

/** This method analyzes the AST to find the variabls accessed from the formula.
 * This is done to find the dependencies to determine the order of calculation. 
 * 
 * - The tree is composed of nodes. Each nodes has a type which correspondds to
 * a specific statement or other program syntax element. In particular, some
 * nodes correspond to variables, which we are collecting here.
 * - The variables are in two types of nodes, a simple Identifier node or a
 * MemberExpression, which is a sequence of Identifers.
 * - If the variable is a table, then this table is stored in the "depends on map"
 * - In addition to determining which variables a fucntion depends on, some modifiers
 * are also collected for how the variable is used. 
 * -- is declaration - this node should contain an identifier that is a declaration
 * of a local variable
 * @private */
apogee.codeAnalysis.getVariableInfo = function(ast) {
    
    //create the var to hold the parse data
    var processInfo = {};
    processInfo.nameTable = {};
    processInfo.scopeTable = {};
    
    //create the base scope
    var scope = apogee.codeAnalysis.startScope(processInfo);

    //traverse the tree, recursively
    apogee.codeAnalysis.processTreeNode(processInfo,ast,false);
    
    //finish the base scope
    apogee.codeAnalysis.endScope(processInfo,scope);
    
    //finish analyzing the accessed variables
    apogee.codeAnalysis.markLocalVariables(processInfo);
    
    //return the variable names accessed
    return processInfo.nameTable;
}
    
/** This method starts a new loca variable scope, it should be called
 * when a function starts. 
 * @private */
apogee.codeAnalysis.startScope = function(processInfo) {
    //initailize id gerneator
    if(processInfo.scopeIdGenerator === undefined) {
        processInfo.scopeIdGenerator = 0;
    }
    
    //create scope
    var scope = {};
    scope.id = String(processInfo.scopeIdGenerator++);
    scope.parent = processInfo.currentScope;
    scope.localVariables ={};
    
    //save this as the current scope
    processInfo.scopeTable[scope.id] = scope;
    processInfo.currentScope = scope;
}

/** This method ends a local variable scope, reverting to the parent scope.
 * It should be called when a function exits. 
 * @private */
apogee.codeAnalysis.endScope = function(processInfo) {
    var currentScope = processInfo.currentScope;
    if(!currentScope) return;
    
    //set the scope to the parent scope.
    processInfo.currentScope = currentScope.parent;
}

/** This method analyzes the AST (abstract syntax tree). 
 * @private */
apogee.codeAnalysis.processTreeNode = function(processInfo,node,isDeclaration) {
    
    //process the node type
    if((node.type == "Identifier")||(node.type == "MemberExpression")) {
        //process a variable
        apogee.codeAnalysis.processVariable(processInfo,node,isDeclaration);
    } 
    else if((node.type == "FunctionDeclaration")||(node.type == "FunctionExpression")) {
        //process the functoin
        apogee.codeAnalysis.processFunction(processInfo,node);
        
    }
    else if((node.type === "NewExpression")&&(node.callee.type === "Function")) {
        //we currently do not support the function constructor
        //to add it we need to add the local variables and parse the text body
        throw apogee.codeAnalysis.createParsingError("Function constructor not currently supported!",node.loc); 
    }
    else {
        //process some other node
        apogee.codeAnalysis.processGenericNode(processInfo,node);
    }
}
   
/** This method process nodes that are not variabls identifiers. This traverses 
 * down the syntax tree.
 * @private */
apogee.codeAnalysis.processGenericNode = function(processInfo,node) {
    //load the syntax node info list for this node
    var nodeInfoList = apogee.codeAnalysis.syntax[node.type];
    
    //process this list
    if(nodeInfoList === undefined) {
        //node not found
        throw apogee.codeAnalysis.createParsingError("Syntax Tree Node not found: " + node.type,node.loc);
    }
    else if(nodeInfoList === null) {
        //node not supported
        throw apogee.codeAnalysis.createParsingError("Syntax node not supported: " + node.type,node.loc);
    }
    else {
        //this is a good node - process it

        //-------------------------
        // process the node list
        //-------------------------
        for(var i = 0; i < nodeInfoList.length; i++) {
            //get node info
            var nodeInfo = nodeInfoList[i];
            
            //check if this field exists in node
            var childField = node[nodeInfo.name];
            if(childField) {
                
                if(nodeInfo.list) {
                    //this is a list of child nodes
                    for(var j = 0; j < childField.length; j++) {
                        apogee.codeAnalysis.processTreeNode(processInfo,childField[j],nodeInfo.declaration);
                    }
                }
                else {
                    //this is a single node
                    apogee.codeAnalysis.processTreeNode(processInfo,childField,nodeInfo.declaration);
                }
            }
        }
    }
}

/** This method processes nodes that are function. For functions a new scope is created 
 * for the body of the function.
 * @private */
apogee.codeAnalysis.processFunction = function(processInfo,node) {
    var nodeType = node.type;
    var idNode = node.id;
    var params = node.params;
    var body = node.body;
    
    //difference here between the declaration and expression
    // - in declaration the name of the function is a variable in the parent scope
    // - in expression the name is typically left of. But it can be included, in which case
    //   it is a variable only in the child (function) scope. This lets the function call
    //   itself.
    
    if((nodeType === "FunctionDeclaration")&&(idNode)) {
        //parse id node (variable name) in the parent scope
        apogee.codeAnalysis.processTreeNode(processInfo,idNode,true);
    }
    
    //create a new scope for this function
    var scope = apogee.codeAnalysis.startScope(processInfo);
    
    if((nodeType === "FunctionExpression")&&(idNode)) {
        //parse id node (variable name) in the parent scope
        apogee.codeAnalysis.processTreeNode(processInfo,idNode,true);
    }
    
    //process the variable list
    for(var i = 0; i < params.length; i++) {
        apogee.codeAnalysis.processTreeNode(processInfo,params[i],true);
    }
    
    //process the function body
    apogee.codeAnalysis.processTreeNode(processInfo,body,false);
    
    //end the scope for this function
    apogee.codeAnalysis.endScope(processInfo,scope);
}

/** This method processes nodes that are variables (identifiers and member expressions), adding
 * them to the list of variables which are used in tehe formula.
 * @private */
apogee.codeAnalysis.processVariable = function(processInfo,node,isDeclaration) {
    
    //get the variable path and the base name
    var namePath = this.getVariableDotPath(processInfo,node);
    if(!namePath) return;
    
    var baseName = namePath[0];
    
    //check if it is an excluded name - such as a variable name used by javascript
    if(apogee.codeAnalysis.EXCLUSION_NAMES[baseName]) {
        return;
    }
    
    //add to the name table
    var nameEntry = processInfo.nameTable[baseName];
    if(!nameEntry) {
        nameEntry = {};
        nameEntry.name = baseName;
        nameEntry.uses = [];
        
        processInfo.nameTable[baseName] = nameEntry;
    }
    
    //add a name use entry
    var nameUse = {};
    nameUse.path = namePath;
    nameUse.scope = processInfo.currentScope;
    nameUse.node = node;
    
    nameEntry.uses.push(nameUse);
    
    //if this is a declaration store it as a local varaible
    if(isDeclaration) {
        //store this in the local variables for this scope
        var scopeLocalVariables = processInfo.currentScope.localVariables;
        if(!scopeLocalVariables[baseName]) {
            scopeLocalVariables[baseName] = true;
        }
        else {
            //the variable is being redeclared! that is ok.
        }
    }
}

/** This method returns the variable and its fields which are given by the node.
 * It may return null, meaning there is no variable to add to the dependency.  
 * See notes embedded in the code. It is possible to fool this into making a
 * dependecne on a parent (and all children) when all that is required is a 
 * single child. 
 * @private */
apogee.codeAnalysis.getVariableDotPath = function(processInfo,node) {
    if(node.type == "Identifier") {
        //read the identifier name
        return [node.name];
    }
    else if(node.type == "MemberExpression") {
        if((node.object.type == "MemberExpression")||(node.object.type == "Identifier")) {
            //MEMBER EXPRESSION OR IDENTIFIER - variable name and/or path
            var variable = this.getVariableDotPath(processInfo,node.object);

            if(node.computed) {
                //COMPUTED CASE
                //We will not try to figure out what the child is. We will only make a dependence on 
                //the parent. This should work but it is too strong. For example
                //we may be including dependence on a while folder when really we depend
                //on a single child in the folder.
                this.processTreeNode(processInfo,node.property,false);
            }
            else {
                //append the member expression property to it
                variable.push(node.property.name);
            }

            return variable;
        }
        else {
            //something other than a variable as the object for the member expressoin
            //ignore the variable path after the call. We will set a dependence
            //on the parent which should work but is too strong. For example
            //we may be including dependence on a while folder when really we depend
            //on a single child in the folder.
            this.processTreeNode(processInfo,node.object,false);
            
            return null;
        }
    }
    else {
        //this shouldn't happen. If it does we didn't code the syntax tree right
        throw this.createParsingError("Unknown application error: expected a variable identifier node.",node.loc);
    }
}

/** This method annotates the variable usages that are local variables. 
 * @private */
apogee.codeAnalysis.markLocalVariables = function(processInfo) {
    for(var key in processInfo.nameTable) {
        var nameEntry = processInfo.nameTable[key];
        var name = nameEntry.name;
        var existNonLocal = false;
        for(var i = 0; i < nameEntry.uses.length; i++) {
            var nameUse = nameEntry.uses[i];
            var scope = nameUse.scope;
            //check if this name is a local variable in this scope or a parent scope
            var varScope = null;
            for(var testScope = scope; testScope; testScope = testScope.parent) {
                if(testScope.localVariables[name]) {
                    varScope = testScope;
                    break;
                }
            }
            if(varScope) {
                //this is a local variable
                nameUse.isLocal = true;
                nameUse.declarationScope = varScope;
            }
            else {
                existNonLocal = true;
            }
        }
        //add a flag to the name enry if all uses are local
        if(!existNonLocal) {
            nameEntry.isLocal = true;
        }
    }
}


/** This method creates an error object. 
 * format:
 * {
 *     description:[string description],
 *     lineNumber:[integer line number, including function declaration line prepended to formula],
 *     column;[integer column on line number]
 * }
 * @private */
apogee.codeAnalysis.createParsingError = function(errorMsg,location) {
    var error = apogee.base.createError(errorMsg,false);
    if(location) {
        error.lineNumber = location.start.line;
        error.column = location.start.column;
    }
    return error;
}
