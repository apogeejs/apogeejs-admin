/** This is a function. */
visicomp.core.FunctionTable = function(workspace,name,argParens) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"function");
	visicomp.core.Member.init.call(this,argParens);
    
    this.argParens = argParens;
    
    //set to an empty function
    this.setData(function(){});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Member);

visicomp.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}