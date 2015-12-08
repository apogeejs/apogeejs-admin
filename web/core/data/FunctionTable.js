/** This is a function. */
visicomp.core.FunctionTable = function(workspace,name,argParens) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"function");
    visicomp.core.Dependant.init.call(this);
	visicomp.core.Codeable.init.call(this,argParens);
    
    //set to an empty function
    this.setData(function(){});
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.FunctionTable,visicomp.core.Codeable);

visicomp.core.FunctionTable.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the function
	this.setData(objectFunction);
}