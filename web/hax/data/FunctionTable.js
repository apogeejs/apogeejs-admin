/** This is a function. */
hax.FunctionTable = function(name,owner,initialData) {
    //base init
    hax.Child.init.call(this,name,hax.FunctionTable.generator);
    hax.DataHolder.init.call(this);
    hax.Dependent.init.call(this);
    hax.ContextHolder.init.call(this);
	hax.Codeable.init.call(this,argList,false);
    
    this.initOwner(owner);
    
    //set initial data
    var argList = initialData.argList ? initialData.argList : [];
    var functionBody = initialData.functionBody ? initialData.functionBody : "";
    var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
    hax.updatemember.applyCode(this,argList,functionBody,supplementalCode);
    if(initialData.description !== undefined) {
        this.setDescription(initialData.description);
    }
}

//add components to this class
hax.base.mixin(hax.FunctionTable,hax.Child);
hax.base.mixin(hax.FunctionTable,hax.DataHolder);
hax.base.mixin(hax.FunctionTable,hax.Dependent);
hax.base.mixin(hax.FunctionTable,hax.ContextHolder);
hax.base.mixin(hax.FunctionTable,hax.Codeable);

//------------------------------
// Codeable Methods
//------------------------------

hax.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}

//------------------------------
// Child Methods
//------------------------------

/** This overrides the get title method of child to return the function declaration. */
hax.FunctionTable.prototype.getDisplayName = function() {
    var name = this.getName();
    var argList = this.getArgList();
    var argListString = argList.join(",");
    return name + "(" + argListString + ")";
}

/** This method creates a child from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
hax.FunctionTable.fromJson = function(owner,json) {
    return new hax.FunctionTable(json.name,owner,json.updateData);
}

/** This method extends the base method to get the property values
 * for the property editting. */
hax.FunctionTable.addPropValues = function(member,values) {
    var argList = member.getArgList();
    var argListString = argList.toString();
    values.argListString = argListString;
    return values;
}

/** This method executes a property update. */
hax.FunctionTable.getPropertyUpdateAction = function(member,oldValues,newValues) {
    if(oldValues.argListString !== newValues.argListString) {
        var newArgList = hax.FunctionTable.parseStringArray(newValues.argListString);
  
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
hax.FunctionTable.parseStringArray = function(argListString) {
    var argList = argListString.split(",");
    for(var i = 0; i < argList.length; i++) {
        argList[i] = argList[i].trim();
    }
    return argList;
}

//============================
// Static methods
//============================

hax.FunctionTable.generator = {};
hax.FunctionTable.generator.displayName = "Function";
hax.FunctionTable.generator.type = "hax.FunctionTable";
hax.FunctionTable.generator.createMember = hax.FunctionTable.fromJson;
hax.FunctionTable.generator.addPropFunction = hax.FunctionTable.addPropValues;
hax.FunctionTable.generator.getPropertyUpdateAction = hax.FunctionTable.getPropertyUpdateAction;

//register this member
hax.Workspace.addMemberGenerator(hax.FunctionTable.generator);


