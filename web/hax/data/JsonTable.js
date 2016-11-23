/** This class encapsulatees a data table for a JSON object */
hax.JsonTable = function(name,owner,initialData) {
    //base init
    hax.Child.init.call(this,name,hax.JsonTable.generator);
    hax.DataHolder.init.call(this);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
	hax.Codeable.init.call(this,[],true);
    
    this.initOwner(owner);
    
    //set initial data
    if(!initialData) {
        //default initail value
        initialData = {};
        initialData.data = "";
    }  
    hax.updatemember.applyCodeOrData(this,initialData);
}

//add components to this class
hax.base.mixin(hax.JsonTable,hax.Child);
hax.base.mixin(hax.JsonTable,hax.DataHolder);
hax.base.mixin(hax.JsonTable,hax.Dependent);
hax.base.mixin(hax.JsonTable,hax.ContextHolder);
hax.base.mixin(hax.JsonTable,hax.Codeable);

//------------------------------
// DataHolder Methods
//------------------------------

/** This method extends set data from DataHOlder. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
hax.JsonTable.prototype.setData = function(data) {
    
	//make this object immutable
	hax.base.deepFreeze(data);

	//store the new object
    return hax.DataHolder.setData.call(this,data);
}

//------------------------------
// Codeable Methods
//------------------------------
	
hax.JsonTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.JsonTable.fromJson = function(owner,json,actionResponse) {
    return new hax.JsonTable(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

hax.JsonTable.generator = {};
hax.JsonTable.generator.displayName = "Table";
hax.JsonTable.generator.type = "hax.JsonTable";
hax.JsonTable.generator.createMember = hax.JsonTable.fromJson;

//register this member
hax.Workspace.addMemberGenerator(hax.JsonTable.generator);