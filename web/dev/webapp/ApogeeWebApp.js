apogeeapp.webapp = {};

//load the settings - telling which custom controls map to which elements
//look up thse components (custom controls)
//look up the dom elements that serve as the containers
//load the data into them.



/** This is the main class of the apogee application. */
apogeeapp.webapp.ApogeeWebApp = function(componentMap,workspaceUrl) {
    
    //--------------------------------
    //component map:
    // full component name:{
    // containerId:containerId
    //}
    this.componentMap = componentMap;
    //---------------------------------
    
    this.workspaceUrl = workspaceUrl;
    
    this.loadWorkspace();
}

apogeeapp.webapp.ApogeeWebApp.prototype.loadWorkspace = function() {
    var promise = apogee.net.promiseJsonRequest(this.workspaceUrl);
    
    var instance = this;
    var onSuccess = function(workspaceJson) {
        instance.processWorkspace(workspaceJson);
    }
    var onError = function(errorMessage) {
        alert("Error loading workspace: " + errorMessage);
    }
    promise.then(onSuccess).catch(onError);
}

apogeeapp.webapp.ApogeeWebApp.prototype.processWorkspace = function(workspaceJson) {
    try {
        //add links, if applicable
        if((workspaceJson.jsLinks)&&(workspaceJson.jsLinks.length > 0)) {
            alert("workspace js links not supported yet!");
        }
        if((workspaceJson.cssLinks)&&(workspaceJson.cssLinks.length > 0)) {
			alert("workspace css links not supported yet!");
        }
		else {
		}
        
        var workspaceDataJson = workspaceJson.workspace;
        var workspaceComponentsJson = workspaceJson.components;
        
        //load workspace
        this.workspace = new apogee.Workspace(workspaceDataJson);
        
        var instance = this;
        //add a member updated listener
        var memberUpdatedCallback = function(member) {
            instance.memberUpdated(member);
        }
        this.workspace.addListener(apogee.updatemember.MEMBER_UPDATED_EVENT, memberUpdatedCallback);
        
        //load component
        this.processComponents(workspaceComponentsJson);
    }
    catch(error) {
        alert("Error loading workspace: " + error.message);
    }
    	
   }

apogeeapp.webapp.ApogeeWebApp.prototype.processComponents = function(componentsJson) {
    //load the components map
    var allComponentsMap = {};
    var parentName = "";
    this.addComponentsToMap(allComponentsMap,parentName,componentsJson);
    
    //get the componets in the compon
    for(var fullName in this.componentMap) {
        var componentEntry = this.componentMap[fullName];
        var inputJson = allComponentsMap[fullName];
        
        if(!inputJson) {
            alert("Component not found in input: " + fullName);
        }
        
        this.createComponent(componentEntry,inputJson);
    }
    
}
    
apogeeapp.webapp.ApogeeWebApp.prototype.addComponentsToMap = function(map,parentName,componentsJson) {
    //make component map
    for(var componentName in componentsJson) {
        var componentJson = componentsJson[componentName];
        
        var fullName;
        if(parentName.length > 0) fullName = parentName + "." + componentName;
        else fullName = componentName;
        
        map[fullName] = componentJson
        
        if(componentJson.children) {
            this.addComponentsToMap(map,fullName,componentJson.children);
            delete componentJson.children;
        }
    }
}

apogeeapp.webapp.ApogeeWebApp.prototype.createComponent = function(componentEntry,inputJson) {
    console.log("another entry!");
}

apogeeapp.webapp.ApogeeWebApp.prototype.memberUpdated = function(member) {
    console.log("member updated!");
}


/** This method gets the workspace object. */
apogeeapp.webapp.ApogeeWebApp.prototype.close = function() {
    //delete all the components - to make sure the are cleaned up
//    for(var key in this.componentMap) {
//        var componentInfo = this.componentMap[key];
//        if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
//            componentInfo.component.onDelete();
//        }
//    }
        //handle close!
}

