/** This class encapsulatees a data table for a JSON object */
apogee.JsonTable = function(name,owner,initialData) {
    //base init
    apogee.Child.init.call(this,name,apogee.JsonTable.generator);
    apogee.DataHolder.init.call(this);
    apogee.Dependent.init.call(this);
    apogee.ContextHolder.init.call(this);
	apogee.Codeable.init.call(this,[],true);
    
    this.initOwner(owner);
    
    //set initial data
    if(!initialData) {
        //default initail value
        initialData = {};
        initialData.data = "";
    }  

    if(initialData.functionBody !== undefined) {
        apogee.updatemember.applyCode(this,
            initialData.argList,
            initialData.functionBody,
            initialData.supplementalCode);
    }
    else {
        if(initialData.data === undefined) initialData.data = "";
        
        apogee.updatemember.applyData(this,
            initialData.data);
    }
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
}

//add components to this class
apogee.base.mixin(apogee.JsonTable,apogee.Child);
apogee.base.mixin(apogee.JsonTable,apogee.DataHolder);
apogee.base.mixin(apogee.JsonTable,apogee.Dependent);
apogee.base.mixin(apogee.JsonTable,apogee.ContextHolder);
apogee.base.mixin(apogee.JsonTable,apogee.Codeable);

//------------------------------
// DataHolder Methods
//------------------------------

/** This method extends set data from DataHOlder. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
apogee.JsonTable.prototype.setData = function(data) {
    
	//make this object immutable
	apogee.base.deepFreeze(data);

	//store the new object
    return apogee.DataHolder.setData.call(this,data);
}

//------------------------------
// Codeable Methods
//------------------------------

/** This method returns the argument list. We override it because
 * for JsonTable it gets cleared when data is set. However, whenever code
 * is used we want the argument list to be this value. */
apogee.JsonTable.prototype.getArgList = function() {
    return [];
}
	
apogee.JsonTable.prototype.processMemberFunction = function(memberFunction) {	
    
    //the data is the output of the function
    var data = memberFunction();
    
    //if the return value is a Promise, the data is asynch
    if(apogee.base.isPromise(data)) {
        //result is asynchronous!

        //set pending manually here rather than doing below in a separate action
        var token = apogee.action.getAsynchToken();
        this.setResultPending(true,token);
        
        var instance = this;
       
        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = "asynchFormulaData";
            actionData.member = instance;
            actionData.token = token;
            actionData.data = memberValue;
            var actionResponse =  apogee.action.doAction(actionData);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "updateError";
            actionData.member = instance;
            actionData.token = token;
            actionData.errorMsg = errorMsg;
            var actionResponse =  apogee.action.doAction(actionData);
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
apogee.JsonTable.fromJson = function(owner,json) {
    return new apogee.JsonTable(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

apogee.JsonTable.generator = {};
apogee.JsonTable.generator.displayName = "Table";
apogee.JsonTable.generator.type = "apogee.JsonTable";
apogee.JsonTable.generator.createMember = apogee.JsonTable.fromJson;
apogee.JsonTable.generator.setDataOk = true;
apogee.JsonTable.generator.setCodeOk = true;

//register this member
apogee.Workspace.addMemberGenerator(apogee.JsonTable.generator);