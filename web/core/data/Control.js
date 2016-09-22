/** This class encapsulatees a member used to IO. t does not hold data in the model. */
visicomp.core.Control = function(name,owner) {
    //base init
    visicomp.core.Child.init.call(this,name,visicomp.core.Control.generator);
    visicomp.core.Dependent.init.call(this);
    visicomp.core.ContextHolder.init.call(this);
	visicomp.core.Codeable.init.call(this,["resource"],true);
    
    this.initOwner(owner);
    
    this.resource = null;
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.ContextHolder);
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Codeable);
	
visicomp.core.Control.prototype.getResource = function() {	
    return this.resource;
}    

/** This method updates the resource for this resource. */
visicomp.core.Control.prototype.updateResource = function(resource) {	
    this.resource = resource;
	
    //re-execute, if needed
	if(this.needsCalculating()) {
        this.calculate();
    }
} 

//------------------------------
// Codeable Methods
//------------------------------

visicomp.core.Control.prototype.processObjectFunction = function(objectFunction) {	
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
visicomp.core.Control.fromJson = function(owner,json,updateDataList,actionResponse) {
    
    var control = new visicomp.core.Control(json.name,owner);
    if(json.updateData) {
        json.updateData.member = control;
        updateDataList.push(json.updateData);
    }
    return control;
}

//============================
// Static methods
//============================

visicomp.core.Control.generator = {};
visicomp.core.Control.generator.displayName = "Control";
visicomp.core.Control.generator.type = "visicomp.core.Control";
visicomp.core.Control.generator.createMember = visicomp.core.Control.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Control.generator);





