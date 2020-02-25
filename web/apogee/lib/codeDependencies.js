

/** This method takes the varInfo table from the code analysis and returns
 * a lit of member objects which this member depends on.
 */
export function getDependencyInfo(varInfo,contextManager) {
    var newDependsOnMemberList = [];
	var objectMap = {};
	
	//cycle through the variables used
	for(var baseName in varInfo) {
			
        //for each use of this name that is not local, find the referenced object
        var nameEntry = varInfo[baseName];
        for(var i = 0; i < nameEntry.uses.length; i++) {
            var nameUse = nameEntry.uses[i];
            if(!nameUse.isLocal) {
                //look up the object
                var namePath = nameUse.path;

                //lookup this object
                var impactor = contextManager.getMember(namePath);
                if(impactor) {

                    //add as dependent (note this may not be a data object - check later!)
                    var memberId = impactor.getId();
                    if(!objectMap[memberId]) {
                        newDependsOnMemberList.push(impactor);
                        objectMap[memberId] = true;
                    }
                }
            }
		}
	}
	
	return newDependsOnMemberList;
}