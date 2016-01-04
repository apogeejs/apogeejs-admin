/** This is a worksheet, which is basically a function
 * that is expanded into data objects. */
visicomp.core.Worksheet = function(workspace,name,parent) {
    //base init
    visicomp.core.Child.init.call(this,workspace,name,"worksheet");
    
    //we need to add to parent here, since we use the path for the interanl folder
    parent.addChild(this);
    
    //create the external folder, with the same parent as this
    this.externalFolder = new visicomp.core.Folder(workspace,name);
	this.externalFolder.setParent(parent);
    
    //create the internal folder as a root folder (no parent). But give it
    //the full path name
    this.internalFolder = new visicomp.core.Folder(workspace,this.getFullName());
}

//add components to this class
visicomp.core.util.mixin(visicomp.core.Worksheet,visicomp.core.Child);

/** */
visicomp.core.Worksheet.prototype.getExternalFolder = function() {
    return this.externalFolder;
}

/** */
visicomp.core.Worksheet.prototype.getInternalFolder = function() {
    return this.internalFolder;
}