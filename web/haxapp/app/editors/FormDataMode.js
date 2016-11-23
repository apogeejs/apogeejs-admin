
haxapp.app.FormDataMode = function(component) {
	this.component = component;

	var instance = this;
	var onSave = function(data) {
		instance.onSave(data);
	}
	
	this.editor = new haxapp.app.JsonFormEditor(onSave);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.FormDataMode.prototype.isData = true;

haxapp.app.FormDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.FormDataMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	
	
	this.editor.showData(json,editOk);
}

haxapp.app.FormDataMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

haxapp.app.FormDataMode.prototype.onSave = function(data) {

	var table = this.component.getObject();
	hax.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}

