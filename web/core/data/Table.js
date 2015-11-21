/** This class encapsulatees a data table */
visicomp.core.Table = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"table");
	visicomp.core.FunctionBase.init.call(this);
	
    //this contains the formula and dependency information
    this.codeInfo = null;
	
    //these are a list of tables that depend on this table
    this.impactsList = [];
}

//extend the child object
visicomp.core.Table.prototype = Object.create(visicomp.core.util.mergeObjects(
		visicomp.core.Child,
		visicomp.core.FunctionBase));
visicomp.core.Table.prototype.constructor = visicomp.core.Table;

/** Test function. */
visicomp.core.Table.prototype.print = function() {
    console.log("name: " + this.getData());
}

//FIX THIS UP!!!
/** This is used for saving the workspace. */
visicomp.core.Table.prototype.toJson = function() {
    var json = {};
    json.name = this.name;
    if((this.codeInfo)&&(this.codeInfo.formula)) {
        json.formula = this.codeInfo.formula;
        if(this.codeInfo.supplementalCode) {
            json.supplementalCode = this.codeInfo.supplementalCode;
        }
    }
    else {
        json.data = this.getData();
    }
    return json;
}

/** This method sets the data for this object. It also
 * freezes the object so it is immutable. */
visicomp.core.Table.prototype.setData = function(data) {
    
	//make this object immutable
	visicomp.core.util.deepFreeze(data);

	//store the new object in the parent
    visicomp.core.Child.setData.call(this,data);
}

/** This method gets the dependency manager. */
visicomp.core.Table.prototype.hasFormula = function() {
    return (this.getCodeInfo() != null);
}


/** This calls the update method updates the data objet, setting up the context
 * appropriately. The commands should be set up with the assumption the following
 * variables will be in context: _workspace, _package and _table. */
visicomp.core.Table.prototype.needsExecuting = function() {
	return this.hasFormula();
}

visicomp.core.Table.prototype.execute = function() {	
    //we execute the function here so the user can debug it easily
    var data = visicomp.core.runObjectFunction(this);
	this.setData(data);
}

/** This method updates the data for the object. It should be implemented by
 * the object.
 * @protected */
visicomp.core.Table.prototype.setContent = function(contentData) {

    //read handler data
    var formula = contentData.formula;
    var supplementalCode = contentData.supplementalCode;
    var data = contentData.data;
	
    //set forumula or value, not both
    if(formula) {
        
        //create the update function from the formula text
        var functionText = "function() {\nvar value;\n" + formula + "\nreturn value;\n}";
        
        //create code for formula
        var codeInfo = visicomp.core.updateobject.createCodeInfo(this,functionText,supplementalCode);
        //we might have error info here!
		
        //set code
        this.setCodeInfo(codeInfo);
    }
    else {
        //clear the formula
        this.setCodeInfo(null,null);

        //set data
        this.setData(data);
		
		//fire this for the change in value
		visicomp.core.updateobject.fireUpdatedEvent(this);
    }
}	



