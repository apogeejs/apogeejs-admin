/** This class encapsulatees a data table */
visicomp.core.Resource = function(workspace,name,resourceProcessor) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,visicomp.core.Resource.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
    visicomp.core.Impactor.init.call(this);
	visicomp.core.Codeable.init.call(this,["resourceProcessor"]);
    
    this.resourceProcessor = resourceProcessor;
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Codeable);
visicomp.core.util.mixin(visicomp.core.Resource,visicomp.core.Recalculable);
	
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

visicomp.core.Resource.prototype.processObjectFunction = function(objectFunction) {	
    //exectue the object function passing the resource object.
    objectFunction(this.resourceProcessor);
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.Resource.fromJson = function(workspace,json,updateDataList) {
    
    throw new visicomp.core.util.createError("From JSON not implemented for resource processer");
    var resourceProcesros = null;
    
    var resource = visicomp.core.Resource(workspace,json.name,resourceProcessor);
    return resource;

}

//===================================
// Protected Functions
//===================================

/** This method adds any additional data to the json saved for this child. 
 * @protected */
visicomp.core.Resource.prototype.addToJson = function(json) {
    //call the method from codeable
    visicomp.core.Codeable.addToJson.call(this,json);
    
	//store the processor info
    if(this.resourceProcessor) {
        json.processor = this.resourceProcessor.toJson();
    }
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





