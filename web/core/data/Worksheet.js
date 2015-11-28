/** This is a function. */
visicomp.core.Worksheet = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"function");
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Child);


