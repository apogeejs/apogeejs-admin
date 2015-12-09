
visicomp.core.memberDependencies = {};

/** This method takes the varInfo table from the code analysis and returns
 * an object with two arrays, an array of workspace objects referenced and
 * an array of workspace variable names accessed from the user code.
 */
visicomp.core.memberDependencies.getDependencyInfo = function(varInfo,localFolder,rootFolder) {
	var dependencyInfo = {};
	dependencyInfo.accessedNames = [];
	dependencyInfo.accessedObjects = [];
	var objectMap = {};
	
	//cycle through the variables used
	for(var baseName in varInfo) {
		
		//check if this is an object from the workspace
		//check local folder
		var baseObject = localFolder.lookupChild(baseName);
		var isFromLocalFolder;
		if(baseObject) {
			isFromLocalFolder = true;
		}
		else {
			//not from local folder, check root folder
			isFromLocalFolder = false;
			baseObject = rootFolder.lookupChild(baseName);
		}
		
		if(baseObject) {
			//this is a reference to the workspace
			
			//we need to make sure these are not local references
			var isNonLocalReference = false;
			
			//for each use of this name that is not local, find the referenced object
			var nameEntry = varInfo[baseName];
			for(var i = 0; i < nameEntry.uses.length; i++) {
				var nameUse = nameEntry.uses[i];
				if(!nameUse.isLocal) {
					//this is a referneced object from workspace, not jsut a local reference
					isNonLocalReference = true
					
					//look up the object
					var namePath = nameUse.path;
					
					//lookup this object
					var folder = isFromLocalFolder ? localFolder : rootFolder;
					var object = folder.lookupChildFromPath(namePath);
					if(object) {
                        
                        if(!object.isImpactor) {
                            throw visicomp.core.util.createError("An object may not depend on the object " + object.getName());
                        }
                        
						//save the object to dependencies
						var fullName = object.getFullName();
						if(!objectMap[fullName]) {
							dependencyInfo.accessedObjects.push(object);
							objectMap[fullName] = true;
						}
					}
				}
			}
			
			//save this base name if it is used for a non local reference
			if(isNonLocalReference) {
				var accessInfo = {};
				accessInfo.baseName = baseName;
				accessInfo.isLocalFolder = isFromLocalFolder;
				dependencyInfo.accessedNames.push(accessInfo);
			}
		}
	}
	
	return dependencyInfo;
}


//
///** This method process the final variables list found in the ast, determining the
// * dependendcies and any errors. 
// * @private */
//visicomp.core.CodeAnalyzer.prototype.processVariableList = function() {
//    
//    //process all the variables in the variable list
//    for(var key in this.variables) {
//        var variableInfo = this.variables[key];
//            
//        //check error cases
//        {
//            var msg;
//            
////apply only to tables?
//            //this object can not be modified
//            if((variableInfo.member)&&(variableInfo.modified)) {
//                if(variableInfo.member == this.member) {
//                    msg = "To modify the local table use the variable name 'value' rather than the table name.";
//                }
//                else {
//                    msg = "Only the local table should be modified in the formula, using the variable name 'value'";
//                }
//                throw this.createParsingError(msg,variableInfo.loc);
//            }
////I should check that the local table is not referenced. It will not have been set yet, at least in theory.
////Worse, it may be initialized with old data.
//            
//      
////oops - we need ot exclued the standard javascript identifiers, like "Math". 
////IF WE WANT TO DO THIS WE NEED A WHITE LIST (for what is allowed), A BLACK LIST
////(for what is not allowed) and the rest is considered a global variable.
////            //global variable can not be accessed
////            if((!variableInfo.object)&&(!variableInfo.local)) {
////                msg = "Global variables can not be accessed in the formula: " + key;
////                throw this.createParsingError(msg,variableInfo.loc);
////            }
//        }
//        
//       //save dependant memberss
//       if(variableInfo.member) {
//           this.dependsOn.push(variableInfo);
//       }
//    }
//}
//
//
//



