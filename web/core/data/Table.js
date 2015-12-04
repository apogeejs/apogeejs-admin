/** This class encapsulatees a data table */
visicomp.core.Table = function(workspace,name) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"table");
	visicomp.core.Member.init.call(this,"");
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Child);
visicomp.core.util.mixin(visicomp.core.Table,visicomp.core.Member);

/** This method sets the data for this object. It also
 * freezes the object so it is immutable. */
visicomp.core.Table.prototype.setData = function(data) {
    
	//make this object immutable
	visicomp.core.util.deepFreeze(data);

	//store the new object in the parent
    visicomp.core.Child.setData.call(this,data);
}

visicomp.core.Table.prototype.processObjectFunction = function(objectFunction) {	
    //tjhe data is the output of the function
    var data = objectFunction();
	this.setData(data);
}



