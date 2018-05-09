/** This class encapsulatees a data table for a JSON object */
apogee.JavascriptTable = function(name,owner,initialData) {
    //base init
    apogee.Member.init.call(this,name,apogee.JavascriptTable.generator);
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
apogee.base.mixin(apogee.JavascriptTable,apogee.Member);
apogee.base.mixin(apogee.JavascriptTable,apogee.Dependent);
apogee.base.mixin(apogee.JavascriptTable,apogee.ContextHolder);
apogee.base.mixin(apogee.JavascriptTable,apogee.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

/** This method returns the argument list. We override it because
 * for JavascriptTable it gets cleared when data is set. However, whenever code
 * is used we want the argument list to be this value. */
apogee.JavascriptTable.prototype.getArgList = function() {
    return [];
}
	
apogee.JavascriptTable.prototype.processMemberFunction = function(memberGenerator) {
    
    //first initialize
    var initialized = this.memberFunctionInitialize();
    
    var data;
    if(initialized) {
        //the data is the output of the function
        var memberFunction = memberGenerator();
        data = memberFunction();
    }
    else {
        //initialization issue = error or pending dependancy
        data = undefined;
    }
    
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
            var actionResponse =  apogee.action.doAction(actionData,false);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "updateError";
            actionData.member = instance;
            actionData.token = token;
            actionData.errorMsg = errorMsg;
            var actionResponse =  apogee.action.doAction(actionData,false);
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
// Member Methods
//------------------------------

/** This method extends set data from member. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
apogee.JavascriptTable.prototype.setData = function(data) {
    
	//make this object immutable
	apogee.base.deepFreeze(data);

	//store the new object
    return apogee.Member.setData.call(this,data);
}

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
apogee.JavascriptTable.fromJson = function(owner,json) {
    return new apogee.JavascriptTable(json.name,owner,json.updateData);
}

//============================
// Static methods
//============================

apogee.JavascriptTable.generator = {};
apogee.JavascriptTable.generator.displayName = "Table";
apogee.JavascriptTable.generator.type = "apogee.JavascriptTable";
apogee.JavascriptTable.generator.createMember = apogee.JavascriptTable.fromJson;
apogee.JavascriptTable.generator.setDataOk = true;
apogee.JavascriptTable.generator.setCodeOk = true;

//register this member
apogee.Workspace.addMemberGenerator(apogee.JavascriptTable.generator);