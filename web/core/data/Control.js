/** This class encapsulatees a member used to IO. t does not hold data in the model. */
hax.core.Control = function(name,owner,initialData) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.Control.generator);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
	hax.core.Codeable.init.call(this,["resource"],true);
    
    this.initOwner(owner);
    
    this.resource = null;
    
    if(!initialData) initialData = {};
    var argList = initialData.argList ? initialData.argList : [];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    hax.core.updatemember.applyCode(this,argList,functionBody,supplementalCode);
}

//add components to this class
hax.core.util.mixin(hax.core.Control,hax.core.Child);
hax.core.util.mixin(hax.core.Control,hax.core.Dependent);
hax.core.util.mixin(hax.core.Control,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.Control,hax.core.Codeable);
	
hax.core.Control.prototype.getResource = function() {	
    return this.resource;
}    

/** This method updates the resource for this resource. */
hax.core.Control.prototype.updateResource = function(resource) {	
    this.resource = resource;
	
    //re-execute, if needed
	if(this.needsCalculating()) {
        this.calculate();
    }
} 

//------------------------------
// Codeable Methods
//------------------------------

hax.core.Control.prototype.processObjectFunction = function(objectFunction) {	
    //exectue the object function passing the resource object.
    if(this.resource) {
        objectFunction(this.resource);
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.core.Control.fromJson = function(owner,json,actionResponse) {   
    return new hax.core.Control(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

hax.core.Control.generator = {};
hax.core.Control.generator.displayName = "Control";
hax.core.Control.generator.type = "hax.core.Control";
hax.core.Control.generator.createMember = hax.core.Control.fromJson;

//register this member
hax.core.Workspace.addMemberGenerator(hax.core.Control.generator);





