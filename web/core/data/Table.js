/** This class encapsulatees a data table */
visicomp.core.Table = function(owner,name) {
    //base init
    visicomp.core.Impactor.init.call(this);
    visicomp.core.Child.init.call(this,owner,name,visicomp.core.Table.generator);
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependent.init.call(this);
	visicomp.core.Codeable.init.call(this,[]);
    
    this.setData("");
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Dependent);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Codeable);

//------------------------------
// DataHolder Methods
//------------------------------

/** This method extends set data from DataHOlder. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
visicomp.core.Table.prototype.setData = function(data) {
    
	//make this object immutable
	visicomp.core.util.deepFreeze(data);

	//store the new object in the parent
    return visicomp.core.DataHolder.setData.call(this,data);
}

//------------------------------
// Codeable Methods
//------------------------------
	
visicomp.core.Table.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
visicomp.core.Table.fromJson = function(owner,json,updateDataList,actionResponse) {
    var table = new visicomp.core.Table(owner,json.name);
    if(json.updateData) {
        json.updateData.member = table;
        updateDataList.push(json.updateData);
    }
    return table;
}

//============================
// Static methods
//============================

visicomp.core.Table.generator = {};
visicomp.core.Table.generator.displayName = "Table";
visicomp.core.Table.generator.type = "visicomp.core.Table";
visicomp.core.Table.generator.createMember = visicomp.core.Table.fromJson;

//register this member
visicomp.core.Workspace.addMemberGenerator(visicomp.core.Table.generator);