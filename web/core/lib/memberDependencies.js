


/** This method processes nodes that are variables (identifiers and member expressions), adding
 * them to the list of variables which are used in tehe formula.
 * @private */
visicomp.core.CodeAnalyzer.prototype.processVariable = function(processInfo,node,isModified,isDeclaration) {
    
    //get the variables
    var namePath = this.getVariableDotPath(node);
	
	//lookup the member (only if this is not a local variable)
	//first determine the name base folder on which the name is based
	//we will base this on whether the first name in the path is in the folder,
	//first checking the local folder and then the root folder for the workspace
	
	var object;
	var internalReference;
    var localReference;
	var nameIndex = 0;
    var baseName = namePath[nameIndex];
	
    if(!isDeclaration) {
        object = this.folder.lookupChild(baseName);
        if(object != null) {
            internalReference = true;
            localReference = true;
        }
        else {
            //check the root folder
            var baseFolder = this.workspace.getRootFolder();
            object = baseFolder.lookupChild(baseName);
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

        //we have determined the base folder for the name, but we might not 
        //have the actual oject
        while((nameIndex < namePath.length-1)&&(object != null)&&(object.getType() === "folder")) {
            nameIndex++;
            object = object.lookupChild(namePath[nameIndex]);
        }

        //flag an error if we found a base folder but not the proper object
        if((internalReference)&&(object == null)) {
            //this shouldn't happen. If it does we didn't code the syntax tree right
            throw this.createParsingError("Table not found: ",node.loc);
        }
    
    }
    else {
        //local variable - no reference to tables
        internalReference = false;
        localReference = false; //refers to table refernece from local folder
        object = null;
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
    
    //store the info on how the variable was accessed - from the "local context" (relative to local folder)
    //or from the "root context" (relative to the root folder) 
//need to get rid of local variabls references , but only in the proper scope!
//not done below
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
        
        //clear anymember reference, if there was one (hoisted local variable)
        delete varInfo.member;
        delete varInfo.localRefBase;
        delete varInfo.localRefBase;
    }
}





/** This method process the final variables list found in the ast, determining the
 * dependendcies and any errors. 
 * @private */
visicomp.core.CodeAnalyzer.prototype.processVariableList = function() {
    
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
                throw this.createParsingError(msg,variableInfo.loc);
            }
//I should check that the local table is not referenced. It will not have been set yet, at least in theory.
//Worse, it may be initialized with old data.
            
      
//oops - we need ot exclued the standard javascript identifiers, like "Math". 
//IF WE WANT TO DO THIS WE NEED A WHITE LIST (for what is allowed), A BLACK LIST
//(for what is not allowed) and the rest is considered a global variable.
//            //global variable can not be accessed
//            if((!variableInfo.object)&&(!variableInfo.local)) {
//                msg = "Global variables can not be accessed in the formula: " + key;
//                throw this.createParsingError(msg,variableInfo.loc);
//            }
        }
        
       //save dependant memberss
       if(variableInfo.member) {
           this.dependsOn.push(variableInfo);
       }
    }
}






