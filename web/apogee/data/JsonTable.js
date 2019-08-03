import base from "/apogeeutil/base.js";
import util from "/apogeeutil/util.js";

/** This class encapsulatees a data table for a JSON object */
apogee.JsonTable = function(name,owner,initialData) {
    //base init
    apogee.Member.init.call(this,name,apogee.JsonTable.generator);
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
base.mixin(apogee.JsonTable,apogee.Member);
base.mixin(apogee.JsonTable,apogee.Dependent);
base.mixin(apogee.JsonTable,apogee.ContextHolder);
base.mixin(apogee.JsonTable,apogee.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

/** This method returns the argument list. We override it because
 * for JsonTable it gets cleared when data is set. However, whenever code
 * is used we want the argument list to be this value. */
apogee.JsonTable.prototype.getArgList = function() {
    return [];
}
	
apogee.JsonTable.prototype.processMemberFunction = function(memberGenerator) {
    
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
    
    if(data === util.INVALID_VALUE) {
        //value is invalid if return is this predefined value
        this.setResultInvalid(true);
    }
    else if(data instanceof Promise) {
        //if the return value is a Promise, the data is asynch asynchronous!
        apogee.updatemember.applyPromiseData(this,data);
    }
    else {
        //result is normal synchronous data
        this.setData(data); 
    }
}

//------------------------------
// Member Methods
//------------------------------

/** This method extends set data from member. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
apogee.JsonTable.prototype.setData = function(data) {
    
	//make this object immutable
	base.deepFreeze(data);

	//store the new object
    return apogee.Member.setData.call(this,data);
}

/** This method creates a member from a json. It should be implemented as a static
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