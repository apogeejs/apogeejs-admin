/** This class encapsulatees a data table */
visicomp.core.Table = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"table");
    visicomp.core.DataHolder.init.call(this);
    visicomp.core.Dependant.init.call(this);
    visicomp.core.Impactor.init.call(this);
	visicomp.core.Codeable.init.call(this,[]);
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.DataHolder);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Dependant);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Impactor);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Codeable);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Recalculable);

/** This method extends set data from Child. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
visicomp.core.Table.prototype.setData = function(data) {
    
	//make this object immutable
	visicomp.core.util.deepFreeze(data);

	//store the new object in the parent
    return visicomp.core.DataHolder.setData.call(this,data);
}
	
visicomp.core.Table.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}



