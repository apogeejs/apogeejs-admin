/** This class encapsulatees a data table */
visicomp.core.Resource = function(workspace,name,resourceProcessor) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"resource");
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
    visicomp.core.Impactor.init.call(this);
	visicomp.core.Codeable.init.call(this,"(resource)");
    
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
    
visicomp.core.Resource.prototype.processObjectFunction = function(objectFunction) {	
    //texectue the object function passing the resource object.
    objectFunction(this.resourceProcessor);
}





