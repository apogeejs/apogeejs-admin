/** This class encapsulatees a data table for a jvascript object
 * There are two problems with this right now
 * 1) This freezes the object the sme way it freezes a JSON object, however, a 
 * javascript object can have loops, which will cause an infinite code loop.
 * 2) The real bad think about this is that a javascript object can be used to store state,
 * which will invalidate some of our functional programming/immutable concept. I think
 * maybe we want to not use this. (Note, this problem also can exist in a function. We
 * should figure out how to prevent it there if possible.)
 * 
 *  What I really want out of this is an object that is like a JSON but allows functions.
 *  
 *   TBD on if we actually use this. 
 * */
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
    
    
    if(data === apogee.util.INVALID_VALUE) {
        //value is invalid if return is this predefined value
        this.setResultInvalid(true);
    }
    else if(apogee.base.isPromise(data)) {
        //if the return value is a Promise, the data is asynch asynchronous!

        //set pending manually here rather than doing below in a separate action
        this.setResultPending(true,data);
        
        var instance = this;
       
        var asynchCallback = function(memberValue) {
            //set the data for the table, along with triggering updates on dependent tables.
            var actionData = {};
            actionData.action = "asynchFormulaData";
            actionData.member = instance;
            actionData.promise = data;
            actionData.data = memberValue;
            var actionResponse =  apogee.action.doAction(actionData,false);
        }
        var asynchErrorCallback = function(errorMsg) {
            var actionData = {};
            actionData.action = "updateError";
            actionData.member = instance;
            actionData.promise = data;
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