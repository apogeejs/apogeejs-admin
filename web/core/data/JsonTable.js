/** This class encapsulatees a data table for a JSON object */
hax.core.JsonTable = function(name,owner,initialData) {
    //base init
    hax.core.Child.init.call(this,name,hax.core.JsonTable.generator);
    hax.core.DataHolder.init.call(this);
    hax.core.Dependent.init.call(this);
    hax.core.ContextHolder.init.call(this);
	hax.core.Codeable.init.call(this,[],true);
    
    this.initOwner(owner);
    
    //set initial data
    if(!initialData) {
        //default initail value
        initialData = {};
        initialData.data = "";
    }  
    hax.core.updatemember.applyCodeOrData(this,initialData);
}

//add components to this class
hax.core.util.mixin(hax.core.JsonTable,hax.core.Child);
hax.core.util.mixin(hax.core.JsonTable,hax.core.DataHolder);
hax.core.util.mixin(hax.core.JsonTable,hax.core.Dependent);
hax.core.util.mixin(hax.core.JsonTable,hax.core.ContextHolder);
hax.core.util.mixin(hax.core.JsonTable,hax.core.Codeable);

//------------------------------
// DataHolder Methods
//------------------------------

/** This method extends set data from DataHOlder. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
hax.core.JsonTable.prototype.setData = function(data) {
    
	//make this object immutable
	hax.core.util.deepFreeze(data);

	//store the new object
    return hax.core.DataHolder.setData.call(this,data);
}

//------------------------------
// Codeable Methods
//------------------------------
	
hax.core.JsonTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.core.JsonTable.fromJson = function(owner,json,actionResponse) {
    return new hax.core.JsonTable(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

hax.core.JsonTable.generator = {};
hax.core.JsonTable.generator.displayName = "Table";
hax.core.JsonTable.generator.type = "hax.core.JsonTable";
hax.core.JsonTable.generator.createMember = hax.core.JsonTable.fromJson;

//register this member
hax.core.Workspace.addMemberGenerator(hax.core.JsonTable.generator);