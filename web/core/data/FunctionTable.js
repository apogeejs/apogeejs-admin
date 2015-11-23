/** This is a function. */
visicomp.core.FunctionTable = function(name,argParens) {
    //base init
    visicomp.core.Child.init.call(this,name,"function");
	visicomp.core.Member.init.call(this);
    
    this.argParens = argParens;
    
    //set to an empty function
    this.setData(function(){});
}

//extend the child object
visicomp.core.FunctionTable.prototype = Object.create(visicomp.core.util.mergeObjects(
		visicomp.core.Child,
		visicomp.core.Member));
visicomp.core.FunctionTable.prototype.constructor = visicomp.core.Table;

visicomp.core.FunctionTable.prototype.getArgParensString = function() {	
    return this.argParens;
}

visicomp.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}