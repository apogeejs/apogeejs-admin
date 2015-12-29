/** This function parses the code and returns a table that gives the variable use
 * in the passed function. The var info table has the following content
 * - it is a map with an entry for each variable accessed. (This refers just to
 * a variable and not to field access on that variable.
 * - the key for an entry is the name of the variable
 * - for each entry there is an array of usages. Each usage as the following info:
 * -- nameUse.path: an array of names constructing the field accessed.
   -- nameUse.scope: a reference to a scope object
   -- nameUse.node: the AST node that identifies this variable
   -- nameUse.isModified: true if the variable is modified (not 100% accurate)
   -- nameUse.isLocal: true if this is a reference to a local variable
   -- nameUse.decalredScope: for local variables only, gives the scope in which the lcoal variable is declared.
 * - additionally, there is a flag indicating if all uses of a name are local variables
 * -- isLocal: true if all uses of a varaible entry are local variables
 **/ 

visicomp.core.codeAnalysis = {};

/** Syntax for AST, names from Esprima.
 * Each entry is a list of nodes inside a node of a given type. the list
 * contains entries with the given fields:
 * {
 *     name:[the name of the field in the node]
 *     list:[true if the field is a list of nodes]
 *     modified:[boolean indicating if the field correspondes to a modified variable
 *     declaration:[boolean indicating if the field corrsponds to a field declaration]
 * @private */
visicomp.core.codeAnalysis.syntax = {
    AssignmentExpression: [{name:'left',modified:true},{name:'right'}],
    ArrayExpression: [{name:'elements',list:true}],
    ArrowFunctionExpression: [{name:'params',list:true},{name:'body'},{name:'defaults',list:true}],
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
    Property: [], //this is handled specially
    ReturnStatement: [{name:'argument'}],
    SequenceExpression: [{name:'expressions',list:true}],
    ObjectExpression: [], //this is handled specially  
    SwitchCase: [{name:'test'},{name:'consequent',list:true}],
    SwitchStatement: [{name:'discriminant'},{name:'cases',list:true}],
    ThisExpression: [],
    ThrowStatement: [{name:'argument'}],
    TryStatement: [
        {name:'block',list:true},
        {name:'handler'},
        {name:'finalizer',list:true}
        //guards omitted, moz specific
    ],
    UnaryExpression: [
        {name:'argument'}
        //the delete operator modifies, but we will skip that error check here
        //"-" | "+" | "!" | "~" | "typeof" | "void" | "delete"
    ],
    UpdateExpression: [{identifierNode:'argument',modified:true}],
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
    TaggedTemplateExpression: null,
    TemplateElement: null,
    TemplateLiteral: null
    
};

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
visicomp.core.codeAnalysis.analyzeCode = function(functionText) {

    //parse the code
    var ast = visicomp.core.codeAnalysis.parseCode(functionText);

    //get the variable list
    var varInfo = visicomp.core.codeAnalysis.getVariableInfo(ast);
    
    //return the variable info
    return varInfo;
}

/** This method parses the code, returning the abstract syntax tree or 
 * any errors in the code. If there is an error parsing the code an exception
 * is thrown.
 * @private */
visicomp.core.codeAnalysis.parseCode = function(codeText) { 
    //parse the code
    var ast = esprima.parse(codeText, { tolerant: true, loc: true });
    
    //check for errors in parsing
    if((ast.errors)&&(ast.errors.length > 0)) {
		var error;
		if(ast.errors.length > 1) {
			error = this.createCompoundParsingError(ast.errors);
		}
		else {
			error = ast.errors[0];
		}
        throw error;
    }
    
    return ast;
}

/** This method analyzes the AST to find the variabls accessed from the formula.
 * This is done to find the dependencies to determine the order of calculation
 * and to do some checks (not exhaustive) that the user didn't access or modify 
 * some variables that should not be accessed or modified: no access of globals,
 * no modify tables other than through the "value" variable. 
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
 * -- is modified - this node should contain an identifier that is a variable that
 * is modified. (Note this is not exhaustive. Checks that are not doen here will
 * be enforced elsewhere, though it would be preferebly to get them here.
 * @private */
visicomp.core.codeAnalysis.getVariableInfo = function(ast) {
    
    //create the var to hold the parse data
    var processInfo = {};
    processInfo.nameTable = {};
    processInfo.scopeTable = {};
    
    //create the base scope
    var scope = visicomp.core.codeAnalysis.startScope(processInfo);

    //traverse the tree, recursively
    visicomp.core.codeAnalysis.processTreeNode(processInfo,ast,false,false);
    
    //finish the base scope
    visicomp.core.codeAnalysis.endScope(processInfo,scope);
    
    //finish analyzing the accessed variables
    visicomp.core.codeAnalysis.markLocalVariables(processInfo);
    
    //return the variable names accessed
    return processInfo.nameTable;
}
    
/** This method starts a new loca variable scope, it should be called
 * when a function starts. 
 * @private */
visicomp.core.codeAnalysis.startScope = function(processInfo) {
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
visicomp.core.codeAnalysis.endScope = function(processInfo) {
    var currentScope = processInfo.currentScope;
    if(!currentScope) return;
    
    //set the scope to the parent scope.
    processInfo.currentScope = currentScope.parent;
}

/** This method analyzes the AST (abstract syntax tree). 
 * @private */
visicomp.core.codeAnalysis.processTreeNode = function(processInfo,node,isModified,isDeclaration) {
    
    //process the node type
    if((node.type == "Identifier")||(node.type == "MemberExpression")) {
        //process a variable
        visicomp.core.codeAnalysis.processVariable(processInfo,node,isModified,isDeclaration);
    } 
    else if((node.type == "FunctionDeclaration")||(node.type == "FunctionExpression")) {
        //process the functoin
        visicomp.core.codeAnalysis.processFunction(processInfo,node);
        
    }
    else if((node.type === "NewExpression")&&(node.callee.type === "Function")) {
        //we currently do not support the function constructor
        //to add it we need to add the local variables and parse the text body
        throw visicomp.core.codeAnalysis.createParsingError("Function constructor not currently supported!",node.loc); 
    }
    else {
        //process some other node
        visicomp.core.codeAnalysis.processGenericNode(processInfo,node);
    }
}
   
/** This method process nodes that are not variabls identifiers. This traverses 
 * down the syntax tree.
 * @private */
visicomp.core.codeAnalysis.processGenericNode = function(processInfo,node) {
    //load the syntax node info list for this node
    var nodeInfoList = visicomp.core.codeAnalysis.syntax[node.type];
    
    //process this list
    if(nodeInfoList === undefined) {
        //node not found
        throw visicomp.core.codeAnalysis.createParsingError("Syntax Tree Node not found: " + node.type,node.loc);
    }
    else if(nodeInfoList === null) {
        //node not supported
        throw visicomp.core.codeAnalysis.createParsingError("Syntax node not supported: " + node.type,node.loc);
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
                        visicomp.core.codeAnalysis.processTreeNode(processInfo,childField[j],nodeInfo.modified,nodeInfo.declaration);
                    }
                }
                else {
                    //this is a single node
                    visicomp.core.codeAnalysis.processTreeNode(processInfo,childField,nodeInfo.modified,nodeInfo.declaration);
                }
            }
        }
    }
}

/** This method processes nodes that are function. For functions a new scope is created 
 * for the body of the function.
 * @private */
visicomp.core.codeAnalysis.processFunction = function(processInfo,node) {
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
        visicomp.core.codeAnalysis.processTreeNode(processInfo,idNode,false,true);
    }
    
    //create a new scope for this function
    var scope = visicomp.core.codeAnalysis.startScope(processInfo);
    
    if((nodeType === "FunctionExpression")&&(idNode)) {
        //parse id node (variable name) in the parent scope
        visicomp.core.codeAnalysis.processTreeNode(processInfo,idNode,false,true);
    }
    
    //process the variable list
    for(var i = 0; i < params.length; i++) {
        visicomp.core.codeAnalysis.processTreeNode(processInfo,params[i],false,true);
    }
    
    //process the function body
    visicomp.core.codeAnalysis.processTreeNode(processInfo,body,false,false);
    
    //end the scope for this function
    visicomp.core.codeAnalysis.endScope(processInfo,scope);
}

/** This method processes nodes that are variables (identifiers and member expressions), adding
 * them to the list of variables which are used in tehe formula.
 * @private */
visicomp.core.codeAnalysis.processVariable = function(processInfo,node,isModified,isDeclaration) {
    
    //get the variable path and the base name
    var namePath = this.getVariableDotPath(processInfo,node);
    var baseName = namePath[0];
    
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
    nameUse.isModified = isModified;
    
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
 * In the case the fields are calculated, we do not attempt to return these
 * fields. We do however factor the expressions nodes into the dependencies. 
 * @private */
visicomp.core.codeAnalysis.getVariableDotPath = function(processInfo,node) {
    if(node.type == "Identifier") {
        //read the identifier name
        return [node.name];
    }
    else if(node.type == "MemberExpression") {
        //read the parent identifer
        var variable = this.getVariableDotPath(processInfo,node.object);
        
        if(node.computed) {
            //the property name is an expression - process the expression but don't recording the field name
            this.processTreeNode(processInfo,node.property,false,false);
        }
        else {
            //append the member expression property to it
            variable.push(node.property.name);
        }
        
        return variable;
    }
    else {
        //this shouldn't happen. If it does we didn't code the syntax tree right
        throw this.createParsingError("Unknown application error: expected a variable identifier node.",node.loc);
    }
}

/** This method annotates the variable usages that are local variables. 
 * @private */
visicomp.core.codeAnalysis.markLocalVariables = function(processInfo) {
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
visicomp.core.codeAnalysis.createParsingError = function(errorMsg,location) {
    var error = visicomp.core.util.createError(errorMsg,"ParsingError");
    if(location) {
        error.lineNumber = location.start.line;
        error.column = location.start.column;
    }
    return error;
}

visicomp.core.codeAnalysis.createCompoundParsingError = function(errors) {
    var errorMsg = "";
    for(var i = 0; i < errors.length; i++) {
        errorMsg += errors[i];
    }
    
    var error = visicomp.core.util.createError(errorMsg,"CompoundParsingError");
    error.errors = errors;
    return error;
}
