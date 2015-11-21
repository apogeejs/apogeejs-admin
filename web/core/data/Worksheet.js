/** This is a function. */
visicomp.core.Worksheet = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"function");
}

//extend the child object
visicomp.core.Worksheet.prototype = Object.create(visicomp.core.Child);
visicomp.core.Worksheet.prototype.constructor = visicomp.core.Worksheet;


