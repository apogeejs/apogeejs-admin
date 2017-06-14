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
    return [];
}
	
hax.JsonTable.prototype.processMemberFunction = function(memberFunction) {	
    
    //the data is the output of the function
    var data = memberFunction();
    
    //if the return value is a Promise, the data is asynch
    if(hax.base.isPromise(data)) {
        //result is asynchronous!

        //set pending manually here rather than doing below in a separate action
        var token = hax.action.getAsynchToken();
        this.setResultPending(true,token);
        
        var instance = this;
       
        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = "asynchFormulaData";
            actionData.member = instance;
            actionData.token = token;
            actionData.data = memberValue;
            var actionResponse =  hax.action.doAction(actionData);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "updateError";
            actionData.member = instance;
            actionData.token = token;
            actionData.errorMsg = errorMsg;
            var actionResponse =  hax.action.doAction(actionData);
        }

        //call appropriate action when the promise resolves.
        data.then(asynchCallback).catch(asynchErrorCallback);
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
hax.JsonTable.generator.setDataOk = true;
hax.JsonTable.generator.setCodeOk = true;

//register this member
hax.Workspace.addMemberGenerator(hax.JsonTable.generator);