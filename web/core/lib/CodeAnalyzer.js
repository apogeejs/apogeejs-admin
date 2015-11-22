/** This class analyzes code, reading the dependencies, checking for errors and 
 * making sure it follows the rules.
 *  
 * Formula Rules:
 * - The formula can access any table, using the name of the table if the table is
 * in the same package or [package name].[table name] if the table is in 
 * another package. These tables are held as local variables in the formula function.
 * - The formula should update the value "value" to update the current table. None
 * of the table objects (given by [table name]) should be modified.
 * - The formula should not access any global variables. It should only use local
 * variables, the table variables and "value".
 **/ 
visicomp.core.CodeAnalyzer = function(member) {
    this.member = member;
    this.package = member.getParent();
    this.workspace = this.package.getWorkspace();
	
    this.dependsOn = [];
    this.variables = {};
    this.errors = null;
}

/** Syntax for AST, names from Esprima.
 * Each entry is a list of nodes inside a node of a given type. the list
 * contains entries with the given fields:
 * {
 *     name:[the name of the field in the node]
 *     list:[true if the field is a list of nodes]
 *     modified:[boolean indicating if the field correspondes to a modified variable
 *     declaration:[boolean indicating if the field corrsponds to a field declaration]
 * @private */
visicomp.core.CodeAnalyzer.syntax = {
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
        {name:'params',list:true,declaration:true},
        {name:'body'}
        //no supporting default functions values
    ],
    FunctionExpression: [
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

/** This method returns the dependancy map for this formula. It is only valid
 * after a successful call to analyzeCode. */
visicomp.core.CodeAnalyzer.prototype.getDependancies = function() {
    return this.dependsOn;
}

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
visicomp.core.CodeAnalyzer.prototype.getErrors = function() {
    return this.errors;
}

/** This method analyzes the code, caluclating the dependancies and checking for
 * errors. if true is returned, the dependencies can be retrieved. If false is returned
 * the errors can be retireved.
 **/
visicomp.core.CodeAnalyzer.prototype.analyzeCode = function(functionText,supplementalCodeText) {

    try {
        //pull out variables
        var success;
        
        //the parser needs something added here
        var modifiedFunctionText = "var __x__ = " + functionText;
        
        success = this.extractVariables(modifiedFunctionText);
        if(!success) return false;
        
        success = this.extractVariables(supplementalCodeText);
        if(!success) return false;
//I need to better identify where there were errors above on failure!
        
        //process the list of variables found in the ast
        this.processVariableList();
        
        //return success
        return true;
    }
    catch(err) {
        //failure, save the errors
        this.errors = [err];
        return false;
    }
}

//-----------------------------------
// Test parsing methods
//-----------------------------------

/** This method parses the code, returning the abstract syntax tree or 
 * any errors in the code. 
 * @private */
visicomp.core.CodeAnalyzer.prototype.extractVariables = function(codeText) {
    //parse the code to generate the ast
    var ast = this.parseCode(codeText);

    //check for errors in parsing
    if((ast.errors)&&(ast.errors.length > 0)) {
        //failure, save the error
        this.errors = ast.errors;
        return false;
    }

    //analyze the ast
    this.analyzeAst(ast);
    
    return true;
}

/** This method parses the code, returning the abstract syntax tree or 
 * any errors in the code. 
 * @private */
visicomp.core.CodeAnalyzer.prototype.parseCode = function(codeText) { 
    //parse the code
    return esprima.parse(codeText, { tolerant: true, loc: true });
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
visicomp.core.CodeAnalyzer.prototype.analyzeAst = function(ast) {
    //traverse the tree, recursively
    this.processTreeNode(ast,false,false);
}

/** This method analyzes the AST (abstract syntax tree). 
 * @private */
visicomp.core.CodeAnalyzer.prototype.processTreeNode = function(node,isModified,isDeclaration) {
    
    //process the node type
    if((node.type == "Identifier")||(node.type == "MemberExpression")) {
        this.processVariable(node,isModified,isDeclaration);
    }
    else {
        this.processGenericNode(node);
    }
}
   
/** This method process nodes that are not variabls identifiers. This traverses 
 * down the syntax tree.
 * @private */
visicomp.core.CodeAnalyzer.prototype.processGenericNode = function(node) {
    //load the syntax node info list for this node
    var nodeInfoList = visicomp.core.CodeAnalyzer.syntax[node.type];
    
    //process this list
    if(nodeInfoList === undefined) {
        //node not found
        throw this.createErrorObject("Syntax Tree Node not found: " + node.type,node.loc);
    }
    else if(nodeInfoList === null) {
        //node not supported
        throw this.createErrorObject("Syntax node not supported: " + node.type,node.loc);
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
                        this.processTreeNode(childField[j],nodeInfo.modified,nodeInfo.declaration);
                    }
                }
                else {
                    //this is a single node
                    this.processTreeNode(childField,nodeInfo.modified,nodeInfo.declaration);
                }
            }
        }
    }
}

/** This method processes nodes that are variables (identifiers and member expressions), adding
 * them to the list of variables which are used in tehe formula.
 * @private */
visicomp.core.CodeAnalyzer.prototype.processVariable = function(node,isModified,isDeclaration) {
    
    //get the variables
    var namePath = this.getVariableDescription(node);
	
	//lookup the member
	//first determine the name base package on which the name is based
	//we will base this on whether the first name in the path is in the package,
	//first checking the local package and then the root package for the workspace
	
	var object;
	var internalReference;
    var localReference;
	var nameIndex = 0;
	
    var baseName = namePath[nameIndex];
	object = this.package.lookupChild(baseName);
	if(object != null) {
		internalReference = true;
        localReference = true;
	}
	else {
		//check the root package
		var basePackage = this.workspace.getRootPackage();
		object = basePackage.lookupChild(baseName);
		if(object != null) {
			internalReference = true;
            localReference = false;
		}
		else {
			object = null;
			internalReference = false;
            localReference = false;
		}
	}
	
	//we have determined the base package for the name, but we might not 
	//have the actual oject
	while((nameIndex < namePath.length-1)&&(object != null)&&(object.getType() === "package")) {
		nameIndex++;
		object = object.lookupChild(namePath[nameIndex]);
	}
	
	//flag an error if we found a base package but not the proper object
	if((internalReference)&&(object == null)) {
		//this shouldn't happen. If it does we didn't code the syntax tree right
        throw this.createErrorObject("Table not found: ",node.loc);
	}
	
    //add this variable to the variable list
    var objectKey;
    if(object != null) {
        objectKey = object.getFullName();
    }
    else {
//I AM NOT SURE WHAT TO USE FOR THE NAME HERE - this will be used for
//detecting bad global usage, but it is not done now
        objectKey = baseName;
    }
    
    //get or create the var info for this variable
    var varInfo = this.variables[objectKey];
    if(!varInfo) {
        varInfo = {};
        varInfo.member = object;
        varInfo.loc = node.loc; //save the first appearance of this variable
        this.variables[objectKey] = varInfo;
    }
    
    //store the info on how the variable was accessed - from the "local context" (relative to local package)
    //or from the "root context" (relative to the root package)    
    if(internalReference) {
        if((localReference)&&(!varInfo.localRefBase)) {
            varInfo.localRefBase = baseName;
        }
        else if((!localReference)&&(!varInfo.rootRefBase)) {
            varInfo.rootRefBase = baseName;
        }
    }
    
    //add modifier flags
    if(isModified) {
        varInfo.modifed = true;
    }
    if(isDeclaration) {
        varInfo.local = true;
    }
}


/** This method returns the variable and its fields which are given by the node. 
 * In the case the fields are calculated, we do not attempt to return these
 * fields. We do however factor the expressions nodes into the dependencies. 
 * @private */
visicomp.core.CodeAnalyzer.prototype.getVariableDescription = function(node) {
    if(node.type == "Identifier") {
        //read the identifier name
        return [node.name];
    }
    else if(node.type == "MemberExpression") {
        //read the parent identifer
        var variable = this.getVariableDescription(node.object);
        
        if(node.computed) {
            //the property name is an expression - process the expression but don't recording the field name
            this.processTreeNode(node.property,false,false);
        }
        else {
            //append the member expression property to it
            variable.push(node.property.name);
        }
        
        return variable;
    }
    else {
        //this shouldn't happen. If it does we didn't code the syntax tree right
        throw this.createErrorObject("Unknown application error: expected a variable identifier node.",node.loc);
    }
}


/** This method process the final variables list found in the ast, determining the
 * dependendcies and any errors. 
 * @private */
visicomp.core.CodeAnalyzer.prototype.processVariableList = function(allowDataAccess) {
    
    //process all the variables in the variable list
    for(var key in this.variables) {
        var variableInfo = this.variables[key];
            
        //check error cases
        {
            var msg;
            
//apply only to tables?
            //this object can not be modified
            if((variableInfo.member)&&(variableInfo.modified)) {
                if(variableInfo.member == this.member) {
                    msg = "To modify the local table use the variable name 'value' rather than the table name.";
                }
                else {
                    msg = "Only the local table should be modified in the formula, using the variable name 'value'";
                }
                throw this.createErrorObject(msg,variableInfo.loc);
            }
//I should check that the local table is not referenced. It will not have been set yet, at least in theory.
//Worse, it may be initialized with old data.
            
      
//oops - we need ot exclued the standard javascript identifiers, like "Math". 
//IF WE WANT TO DO THIS WE NEED A WHITE LIST (for what is allowed), A BLACK LIST
//(for what is not allowed) and the rest is considered a global variable.
//            //global variable can not be accessed
//            if((!variableInfo.object)&&(!variableInfo.local)) {
//                msg = "Global variables can not be accessed in the formula: " + key;
//                throw this.createErrorObject(msg,variableInfo.loc);
//            }
        }
        
       //save dependant memberss
       if(variableInfo.member) {
           this.dependsOn.push(variableInfo);
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
visicomp.core.CodeAnalyzer.prototype.createErrorObject = function(errorMsg,location) {
    var error = {};
    error.description = errorMsg;
    if(location) {
        error.lineNumber = location.start.line;
        error.column = location.start.column;
    }
    return error;
}
