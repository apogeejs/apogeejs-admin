/** This class encapsulatees a member used to IO. t does not hold data in the model. */
hax.Control = function(name,owner,initialData) {
    //base init
    hax.Child.init.call(this,name,hax.Control.generator);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
	hax.Codeable.init.call(this,["resource"],true);
    
    this.initOwner(owner);
    
    this.resource = null;
    
    if(!initialData) initialData = {};
    var argList = initialData.argList ? initialData.argList : ["resource"];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    hax.updatemember.applyCode(this,argList,functionBody,supplementalCode);
}

//add components to this class
hax.base.mixin(hax.Control,hax.Child);
hax.base.mixin(hax.Control,hax.Dependent);
hax.base.mixin(hax.Control,hax.ContextHolder);
hax.base.mixin(hax.Control,hax.Codeable);
	
hax.Control.prototype.getResource = function() {	
    return this.resource;
}    

/** This method updates the resource for this resource. */
hax.Control.prototype.updateResource = function(resource) {	
    this.resource = resource;
	
    //re-execute, if needed
	if(this.needsCalculating()) {
        this.calculate();
    }
} 

//------------------------------
// Codeable Methods
//------------------------------

hax.Control.prototype.processObjectFunction = function(objectFunction) {	
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
hax.Control.fromJson = function(owner,json,actionResponse) {   
    return new hax.Control(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

hax.Control.generator = {};
hax.Control.generator.displayName = "Control";
hax.Control.generator.type = "hax.Control";
hax.Control.generator.createMember = hax.Control.fromJson;

//register this member
hax.Workspace.addMemberGenerator(hax.Control.generator);





