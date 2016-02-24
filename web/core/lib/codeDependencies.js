
visicomp.core.codeDependencies = {};

/** This method takes the varInfo table from the code analysis and returns
 * a lsit of member objects which this member depends on.
 */
visicomp.core.codeDependencies.getDependencyInfo = function(varInfo,localFolder,rootFolder) {
    var dependencyList = [];
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
			
			//for each use of this name that is not local, find the referenced object
			var nameEntry = varInfo[baseName];
			for(var i = 0; i < nameEntry.uses.length; i++) {
				var nameUse = nameEntry.uses[i];
				if(!nameUse.isLocal) {
					
					//look up the object
					var namePath = nameUse.path;
					
					//lookup this object
					var folder = isFromLocalFolder ? localFolder : rootFolder;
					var object = folder.lookupChildFromPath(namePath);
					if(object) {
                        
                        if(!object.isImpactor) {
                            //this shouldn't happen
                            throw visicomp.core.util.createError("An object may not depend on the object " + object.getName());
                        }
                        
						//save the object to dependencies
						var fullName = object.getFullName();
						if(!objectMap[fullName]) {
							dependencyList.push(object);
							objectMap[fullName] = true;
						}
					}
				}
			}
		}
	}
	
	return dependencyList;
}