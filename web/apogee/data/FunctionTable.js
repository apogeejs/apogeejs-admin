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
    apogee.updatemember.applyCode(this,argList,functionBody,supplementalCode);
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
}

//add components to this class
apogee.base.mixin(apogee.FunctionTable,apogee.Member);
apogee.base.mixin(apogee.FunctionTable,apogee.Dependent);
apogee.base.mixin(apogee.FunctionTable,apogee.ContextHolder);
apogee.base.mixin(apogee.FunctionTable,apogee.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

apogee.FunctionTable.prototype.processMemberFunction = function(memberFunction) {	
	this.setData(memberFunction);
}

apogee.FunctionTable.prototype.postInitializeAction = function() {
    //pending check - we don't know if a function is pending until we
    //actually call it. I didn't know how else to capture this in the 
    //calling code other than use an error. But this is not an error
    if(this.getResultPending()) {
        throw apogee.Codeable.MEMBER_FUNCTION_PENDING;
    }
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
apogee.FunctionTable.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

/** This method executes a property update. */
apogee.FunctionTable.getPropertyUpdateAction = function(member,oldValues,newValues) {
    if(oldValues.argListString !== newValues.argListString) {
        var newArgList = apogee.FunctionTable.parseStringArray(newValues.argListString);
  
        var actionData = {};
        actionData.action = "updateCode";
        actionData.member = member;
        actionData.argList = newArgList;
        actionData.functionBody = member.getFunctionBody();
        actionData.supplementalCode = member.getSupplementalCode();
        return actionData;
    }
    else {
        return null;
    }
}

/** This methdo parses an arg list string to make an arg list array. It is
 * also used outisde this class. */
apogee.FunctionTable.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
}

//============================
// Static methods
//============================

apogee.FunctionTable.generator = {};
apogee.FunctionTable.generator.displayName = "Function";
apogee.FunctionTable.generator.type = "apogee.FunctionTable";
apogee.FunctionTable.generator.createMember = apogee.FunctionTable.fromJson;
apogee.FunctionTable.generator.addPropFunction = apogee.FunctionTable.addPropValues;
apogee.FunctionTable.generator.getPropertyUpdateAction = apogee.FunctionTable.getPropertyUpdateAction;
apogee.FunctionTable.generator.setDataOk = false;
apogee.FunctionTable.generator.setCodeOk = true;

//register this member
apogee.Workspace.addMemberGenerator(apogee.FunctionTable.generator);


