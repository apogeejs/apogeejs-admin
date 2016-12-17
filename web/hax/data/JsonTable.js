/** This class encapsulatees a data table for a JSON object */
hax.JsonTable = function(name,owner,initialData) {
    //base init
    hax.Child.init.call(this,name,hax.JsonTable.generator);
    hax.DataHolder.init.call(this);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
	hax.Codeable.init.call(this,["memberInfo"],true);
    
    this.initOwner(owner);
    
    //set initial data
    if(!initialData) {
        //default initail value
        initialData = {};
        initialData.data = "";
    }  

    if(initialData.functionBody !== undefined) {
        hax.updatemember.applyCode(this,
            initialData.argList,
            initialData.functionBody,
            initialData.supplementalCode);
    }
    else {
        if(initialData.data === undefined) initialData.data = "";
        
        hax.updatemember.applyData(this,
            initialData.data);
    }
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
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

/** This method returns the argument list. We override it because
 * for JsonTable it gets cleared when data is set. However, whenever code
 * is used we want the argument list to be this value. */
hax.JsonTable.prototype.getArgList = function() {
    return ["memberInfo"];
}
	
hax.JsonTable.prototype.processMemberFunction = function(memberFunction) {	
    //used for asynch result
    var memberInfo = {};
    
    //the data is the output of the function
    var data = memberFunction(memberInfo);
    
    if(memberInfo.pending) {
        //result is asynchronous - provide a funtion to pass the result
        var member = this;
        memberInfo.asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = "asynchUpdateData";
            actionData.member = member;
            actionData.data = memberValue;
            var actionResponse =  hax.action.doAction(member.getWorkspace(),actionData);
        }
        memberInfo.asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "asynchUpdateError";
            actionData.member = member;
            actionData.errorMsg = errorMsg;
            var actionResponse =  hax.action.doAction(member.getWorkspace(),actionData);
        }
        this.setResultPending(true);
    }
    else {
        //result is synchronous
        this.setData(data);
    }
}

//------------------------------
// Child Methods
//------------------------------

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.JsonTable.fromJson = function(owner,json) {
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