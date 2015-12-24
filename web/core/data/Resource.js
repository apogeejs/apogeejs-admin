/** This class encapsulatees a data table */
visicomp.core.Resource = function(workspace,name,resourceProcessor) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"resource");
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
	
	//if we have code, rerun it with the new processor
	var objectFunction = visicomp.core.getObjectFunction(this);
	if(objectFunction) {
		//process the object function as needed
		this.processObjectFunction(objectFunction);
	}
} 

visicomp.core.Resource.prototype.processObjectFunction = function(objectFunction) {	
    //texectue the object function passing the resource object.
    objectFunction(this.resourceProcessor);
}







