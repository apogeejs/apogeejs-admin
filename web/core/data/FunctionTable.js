/** This is a function. */
hax.core.FunctionTable = function(name,owner,argList) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.FunctionTable.generator);
    hax.core.DataHolder.init.call(this);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
	hax.core.Codeable.init.call(this,argList,false);
    
    this.initOwner(owner);
    
    //set to an empty function
    this.setData(function(){});
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
hax.core.FunctionTable.fromJson = function(owner,json,updateDataList,actionResponse) {
    var initialArgList;
    //------------------------
    // There are two ways to set the arg list. Here, json.argList, is used in creating 
    // the function table. Otherwise use json.updateData.argList.
    if(json.argList) {
        initialArgList = json.argList;
    }
    else {
        initialArgList = [];
    }
    //-------------------
    
    var functionTable = new hax.core.FunctionTable(json.name,owner,initialArgList);
    if(json.updateData) {
        json.updateData.member = functionTable;
        updateDataList.push(json.updateData);
    }
    return functionTable;
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