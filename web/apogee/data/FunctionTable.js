import base from "/apogeeutil/base.js";
import util from "/apogeeutil/util.js";

/** This is a function. */
apogee.FunctionTable = function(name,owner,initialData) {
    //base init
    apogee.Member.init.call(this,name,apogee.FunctionTable.generator);
    apogee.Dependent.init.call(this);
    apogee.ContextHolder.init.call(this);
	apogee.Codeable.init.call(this,argList,false);
    
    this.initOwner(owner);
    
    //set initial data
    var argList = initialData.argList ? initialData.argList : [];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    this.applyCode(this,argList,functionBody,supplementalCode);
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
}

//add components to this class
base.mixin(apogee.FunctionTable,apogee.Member);
base.mixin(apogee.FunctionTable,apogee.Dependent);
base.mixin(apogee.FunctionTable,apogee.ContextHolder);
base.mixin(apogee.FunctionTable,apogee.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

apogee.FunctionTable.prototype.processMemberFunction = function(memberGenerator) {
    var memberFunction = this.getLazyInitializedMemberFunction(memberGenerator);
	this.setData(memberFunction);
}

apogee.FunctionTable.prototype.getLazyInitializedMemberFunction = function(memberGenerator) {
    var instance = this;

    //create init member function for lazy initialization
    //we need to do this for recursive functions, or else we will get a circular reference
    var initMember = function() {
        var impactorSuccess = instance.memberFunctionInitialize();
        if(impactorSuccess) {
            return memberGenerator();
        }
        else {
            //error handling
            var issue;
            
            //in the case of "result invalid" or "result pending" this is 
            //NOT an error. But I don't know
            //how else to stop the calculation other than throwing an error, so 
            //we do that here. It should be handled by anyone calling a function.
            if(instance.hasError()) {
                issue = new Error("Error in dependency: " + instance.getFullName());

            }
            else if(instance.getResultPending()) {
                issue = base.MEMBER_FUNCTION_PENDING_THROWABLE;
            }
            else if(instance.getResultInvalid()) {
                issue = base.MEMBER_FUNCTION_INVALID_THROWABLE;
            }
            else {
                issue = new Error("Unknown problem in initializing: " + instance.getFullName());
            }
            
            throw issue;
        } 
    }

    //this is called from separate code to make debugging more readable
    return __functionTableWrapper(initMember);
}

//------------------------------
// Member Methods
//------------------------------

/** This overrides the get title method of member to return the function declaration. */
apogee.FunctionTable.prototype.getDisplayName = function(useFullPath) {
    var name = useFullPath ? this.getFullName() : this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    return name + "(" + argListString + ")";
}

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
apogee.FunctionTable.fromJson = function(owner,json) {
    return new apogee.FunctionTable(json.name,owner,json.updateData);
}

/** This method extends the base method to get the property values
 * for the property editting. */
apogee.FunctionTable.readProperties = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

/** This method executes a property update. */
apogee.FunctionTable.getPropertyUpdateAction = function(member,newValues) {
    if(newValues.argListString !== undefined) {
        var newArgList = util.parseStringArray(newValues.argListString);
  
        var actionData = {};
        actionData.action = "updateCode";
        actionData.memberName = member.getFullName();
        actionData.argList = newArgList;
        actionData.functionBody = member.getFunctionBody();
        actionData.supplementalCode = member.getSupplementalCode();
        return actionData;
    }
    else {
        return null;
    }
}

//============================
// Static methods
//============================

apogee.FunctionTable.generator = {};
apogee.FunctionTable.generator.displayName = "Function";
apogee.FunctionTable.generator.type = "apogee.FunctionTable";
apogee.FunctionTable.generator.createMember = apogee.FunctionTable.fromJson;
apogee.FunctionTable.generator.readProperties = apogee.FunctionTable.readProperties;
apogee.FunctionTable.generator.getPropertyUpdateAction = apogee.FunctionTable.getPropertyUpdateAction;
apogee.FunctionTable.generator.setDataOk = false;
apogee.FunctionTable.generator.setCodeOk = true;

//register this member
apogee.Workspace.addMemberGenerator(apogee.FunctionTable.generator);


