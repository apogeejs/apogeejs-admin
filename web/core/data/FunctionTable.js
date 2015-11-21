/** This is a function. */
visicomp.core.FunctionTable = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"function");
}

//extend the child object
visicomp.core.FunctionTable.prototype = Object.create(visicomp.core.Child);
visicomp.core.FunctionTable.prototype.constructor = visicomp.core.FunctionTable;


