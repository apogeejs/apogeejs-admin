/** This class encapsulatees a data table */
visicomp.core.Table = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"table");
	visicomp.core.Member.init.call(this);
	
    //this contains the formula and dependency information
    this.codeInfo = null;
	
    //these are a list of tables that depend on this table
    this.impactsList = [];
}

//extend the child object
visicomp.core.Table.prototype = Object.create(visicomp.core.util.mergeObjects(
		visicomp.core.Child,
		visicomp.core.Member));
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

visicomp.core.Table.prototype.functionBodyWrapperFormat = "function() {\nvar value;\n{0}\nreturn value;\n}";

visicomp.core.Table.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}



