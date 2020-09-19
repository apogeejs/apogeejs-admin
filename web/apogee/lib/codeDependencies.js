import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

/** This method takes the varInfo table from the code analysis and returns
 * a lit of member objects which this member depends on.
 */
export function getDependencyInfo(varInfo,model,contextManager) {
	var dependsOnMap = {};
	
	//cycle through the variables used
	for(var baseName in varInfo) {
			
        //for each use of this name that is not local, find the referenced object
        var nameEntry = varInfo[baseName];
        for(var i = 0; i < nameEntry.uses.length; i++) {
            var nameUse = nameEntry.uses[i];
            if(!nameUse.isLocal) {
                //look up the object
                var namePath = nameUse.path;

                //lookup this object, along with the passthrough dependencies
                let passThroughDependencies = [];
                var impactor = contextManager.getMember(model,namePath,passThroughDependencies);

                //add the impactor to the dependency map
                if(impactor) {
                    //add as dependent
                    var memberId = impactor.getId();
                    if(dependsOnMap[memberId] != apogeeutil.NORMAL_DEPENDENCY) {
                        dependsOnMap[memberId] = apogeeutil.NORMAL_DEPENDENCY;
                    }
                }

                //add the pass through members to the dependency map (give precedence to normal dependencies)
                // passThroughDependencies.forEach(passThroughMember => {
                //     var memberId = passThroughMember.getId();
                //     if(dependsOnMap[memberId] == undefined) {
                //         dependsOnMap[memberId] = apogeeutil.PASS_THROUGH_DEPENDENCY;
                //     }
                // });
            }
		}
	}
	
	return dependsOnMap;
}
