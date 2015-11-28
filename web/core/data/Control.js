/** This is a control. */
visicomp.core.Control = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"function");
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Control,visicomp.core.Child);

