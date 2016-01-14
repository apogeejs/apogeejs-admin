/** This is a function. */
visicomp.core.FunctionTable = function(parent,name,argList) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,parent,name,visicomp.core.FunctionTable.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
	visicomp.core.Codeable.init.call(this,argList);
    visicomp.core.Recalculable.init.call(this);
    
    //set to an empty function
    //this.setData(function(){});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Codeable);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Recalculable);

visicomp.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.FunctionTable.fromJson = function(parent,json,updateDataList) {
    var initialArgList = [];
    var functionTable = new visicomp.core.FunctionTable(parent,json.name,initialArgList);
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