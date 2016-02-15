/** This class encapsulatees a member used to IO. t does not hold data in the model. */
visicomp.core.Resource = function(owner,name) {
    //base init
    visicomp.core.Child.init.call(this,owner,name,visicomp.core.Resource.generator);
    visicomp.core.Dependent.init.call(this);
	visicomp.core.Codeable.init.call(this,["resource"]);
    
    this.resourceProcessor = null;
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Codeable);
	
visicomp.core.Resource.prototype.getResourceProcessor = function() {	
    return this.resourceProcessor;
}    

/** This method updates the resource processor for this resource. */
visicomp.core.Resource.prototype.updateResourceProcessor = function(resourceProcessor) {	
    this.resourceProcessor = resourceProcessor;
	
    //re-execute, if needed
	if(this.needsExecuting()) {
        this.execute();
    }
} 

//------------------------------
// Codeable Methods
//------------------------------

visicomp.core.Resource.prototype.processObjectFunction = function(objectFunction) {	
    //exectue the object function passing the resource object.
    if(this.resourceProcessor) {
        objectFunction(this.resourceProcessor);
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.Resource.fromJson = function(owner,json,updateDataList,actionResponse) {
    
    var resource = new visicomp.core.Resource(owner,json.name);
    if(json.updateData) {
        json.updateData.member = resource;
        updateDataList.push(json.updateData);
    }
    return resource;
}

//============================
// Static methods
//============================

visicomp.core.Resource.generator = {};
visicomp.core.Resource.generator.displayName = "Resource";
visicomp.core.Resource.generator.type = "visicomp.core.Resource";
visicomp.core.Resource.generator.createMember = visicomp.core.Resource.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Resource.generator);





