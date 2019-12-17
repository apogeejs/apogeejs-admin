import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Workspace from "/apogee/data/Workspace.js";
import Member from "/apogee/datacomponents/Member.js";
import Dependent from "/apogee/datacomponents/Dependent.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Codeable from "/apogee/datacomponents/Codeable.js";

/** This is a function. */
function FunctionTable(name,owner,initialData) {
    //base init
    Member.init.call(this,name,FunctionTable.generator);
    Dependent.init.call(this);
    ContextHolder.init.call(this);
	Codeable.init.call(this,argList,false);
    
    this.initOwner(owner);
    
    //set initial data
    var argList = initialData.argList ? initialData.argList : [];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    this.applyCode(argList,functionBody,supplementalCode);
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
}

//add components to this class
base.mixin(FunctionTable,Member);
base.mixin(FunctionTable,Dependent);
base.mixin(FunctionTable,ContextHolder);
base.mixin(FunctionTable,Codeable);

//------------------------------
// Codeable Methods
//------------------------------

FunctionTable.prototype.processMemberFunction = function(memberGenerator) {
    var memberFunction = this.getLazyInitializedMemberFunction(memberGenerator);
	this.setData(memberFunction);
}

FunctionTable.prototype.getLazyInitializedMemberFunction = function(memberGenerator) {
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

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
FunctionTable.fromJson = function(owner,json) {
    return new FunctionTable(json.name,owner,json.updateData);
}

/** This method extends the base method to get the property values
 * for the property editting. */
FunctionTable.readProperties = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

/** This method executes a property update. */
FunctionTable.getPropertyUpdateAction = function(member,newValues) {
    if((newValues.updateData)&&(newValues.updateData.argList !== undefined)) {
        var actionData = {};
        actionData.action = "updateCode";
        actionData.memberName = member.getFullName();
        actionData.argList = newValues.updateData.argList;
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

FunctionTable.generator = {};
FunctionTable.generator.displayName = "Function";
FunctionTable.generator.type = "apogee.FunctionTable";
FunctionTable.generator.createMember = FunctionTable.fromJson;
FunctionTable.generator.readProperties = FunctionTable.readProperties;
FunctionTable.generator.getPropertyUpdateAction = FunctionTable.getPropertyUpdateAction;
FunctionTable.generator.setDataOk = false;
FunctionTable.generator.setCodeOk = true;

//register this member
Workspace.addMemberGenerator(FunctionTable.generator);


