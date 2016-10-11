/** This is a function. */
hax.core.FunctionTable = function(name,owner,initialData) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.FunctionTable.generator);
    hax.core.DataHolder.init.call(this);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
	hax.core.Codeable.init.call(this,argList,false);
    
    this.initOwner(owner);
    
    //set initial data
    var argList = initialData.argList ? initialData.argList : [];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    hax.core.updatemember.applyCode(this,argList,functionBody,supplementalCode);
}

//add components to this class
hax.core.util.mixin(hax.core.FunctionTable,hax.core.Child);
hax.core.util.mixin(hax.core.FunctionTable,hax.core.DataHolder);
hax.core.util.mixin(hax.core.FunctionTable,hax.core.Dependent);
hax.core.util.mixin(hax.core.FunctionTable,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.FunctionTable,hax.core.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

hax.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get title method of child to return the function declaration. */
hax.core.FunctionTable.prototype.getDisplayName = function() {
    var name = this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    return name + "(" + argListString + ")";
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.core.FunctionTable.fromJson = function(owner,json,actionResponse) {
    return new hax.core.FunctionTable(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

hax.core.FunctionTable.generator = {};
hax.core.FunctionTable.generator.displayName = "Function";
hax.core.FunctionTable.generator.type = "hax.core.FunctionTable";
hax.core.FunctionTable.generator.createMember = hax.core.FunctionTable.fromJson;

//register this member
hax.core.Workspace.addMemberGenerator(hax.core.FunctionTable.generator);