/** This is a control. */
visicomp.core.Control = function(name) {
    //base init
    visicomp.core.Child.init.call(this,name,"function");
}

//extend the child object
visicomp.core.Control.prototype = Object.create(visicomp.core.Child);
visicomp.core.Control.prototype.constructor = visicomp.core.Control;

