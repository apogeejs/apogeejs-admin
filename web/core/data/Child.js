/** This encapsulates the namespace functionality of the objects in the workspace.
 * The namespaces are given by packages and the extending objects represent items
 * in the namespace (including packages, tables, functions, etc.). Each object can
 * have a data object, such as a JSON for a table, which is what the developer will
 * access for the given name.
 * 
 * This is not a class, but it is used for the prototype of the objects that inherit from it.
 */
visicomp.core.Child = {};
    
/** This serves as the constructor for the child object, when extending it. */
visicomp.core.Child.init = function(name,type) {
    this.name = name;
    this.type = type;
    this.parent = null;
    this.data = null;
}

/** this method gets the name. */
visicomp.core.Child.getName = function() {
    return this.name;
}

/** This method returns the full name in dot notation for this object. */
visicomp.core.Child.getFullName = function() {
	if(this.parent) {
		if(this.parent.isRoot) {
			return this.name;
		}
		else {
			return this.parent.getFullName() + "." + this.name;
		}
	}
	else {
		return this.name;
	}
}

/** This returns the parent for this package. For the root package
 * this value is null. */
visicomp.core.Child.getParent = function() {
	return this.parent;
}

/** This sets the parent for this package.
 * @private*/
visicomp.core.Child.setParent = function(parent) {
	this.parent = parent;
}

/** this method gets the workspace. */
visicomp.core.Child.getWorkspace = function() {
    var ancestor = this;
	while((ancestor)&&(ancestor.getType() !== "workspace")) {
		ancestor = ancestor.getParent();
	} 
	return ancestor;
}

////////////////////////////////////////////////////////////////////////////////
//FOR LATER
/** this method gets the root package/namespace for this object. */
visicomp.core.Child.getRootPackage = function() {
    var ancestor = this;
	while(ancestor) {
        if(ancestor.isRoot) return ancestor;
		ancestor = ancestor.getParent();
	} 
	return null;
}
////////////////////////////////////////////////////////////////////////////////

/** this method gets the data map. */
visicomp.core.Child.getData = function() {
    return this.data;
}

/** This identifies the type of object. */
visicomp.core.Child.getType = function() {
	return this.type;
}

///** This is used for saving the workspace. */
//visicomp.core.Child.prototype.toJson = function() {
//    //implement this
//}

//========================================
// "Protected" Methods
//========================================

/** This method sets the data for this object. This is the object used by the 
 * code which is identified by this name, for example the JSON object associated
 * with a table. Besides hold the data object, this updates the parent data map. */
visicomp.core.Child.setData = function(data) {
    this.data = data;
    
    //data the data map in the parent if it is a hierarchy container 
    if((this.parent)&&(this.parent.getType() == "package")) {
        this.parent.updateData(this);
    }
}

///** This is a window for a dialog. The title and options are the same as the title
// * and options for a window frame. 
// *
// * @class 
// */
//visicomp.visiui.Dialog = function(title, options) {
//    
//    //use page body and the parent
//    var parentContainer = document.body;
//    
//    //call the parent constructor
//    visicomp.visiui.WindowFrame.call(this,parentContainer,title,options);
//    
//    this.setZIndex(visicomp.visiui.DIALOG_ZINDEX);
//}
//
//visicomp.visiui.Dialog.prototype = Object.create(visicomp.visiui.WindowFrame.prototype);
//visicomp.visiui.Dialog.prototype.constructor = visicomp.visiui.Dialog;
//
///** This method centers the dialog on the page. It must be called after the conten
// * is set, and possibly after it is rendered, so the size of it is calculated. */
//visicomp.visiui.Dialog.prototype.centerOnPage = function() {
//    var element = this.getElement();
//    var x = (document.body.clientWidth - element.clientWidth)/2;
//    var y = (document.body.clientHeight - element.clientHeight)/2;
//    this.setPosition(x,y);
//}



