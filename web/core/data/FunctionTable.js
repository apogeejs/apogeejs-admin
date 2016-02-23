/** This is a function. */
visicomp.core.FunctionTable = function(owner,name,argList) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,owner,name,visicomp.core.FunctionTable.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependent.init.call(this);
	visicomp.core.Codeable.init.call(this,argList,true);
    
    //set to an empty function
    this.setData(function(){});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

visicomp.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get title method of child to return the function declaration. */
visicomp.core.FunctionTable.prototype.getDisplayName = function() {
    var name = this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    return name + "(" + argListString + ")";
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.FunctionTable.fromJson = function(owner,json,updateDataList,actionResponse) {
    var initialArgList = [];
    var functionTable = new visicomp.core.FunctionTable(owner,json.name,initialArgList);
    if(json.updateData) {
        json.updateData.member = functionTable;
        updateDataList.push(json.updateData);
    }
    return functionTable;
}

//============================
// Static methods
//============================

visicomp.core.FunctionTable.generator = {};
visicomp.core.FunctionTable.generator.displayName = "Function";
visicomp.core.FunctionTable.generator.type = "visicomp.core.FunctionTable";
visicomp.core.FunctionTable.generator.createMember = visicomp.core.FunctionTable.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.FunctionTable.generator);