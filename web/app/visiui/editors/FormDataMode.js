
hax.app.visiui.FormDataMode = function(component) {
	this.component = component;

	var instance = this;
	var onSave = function(data) {
		instance.onSave(data);
	}
	
	this.editor = new hax.app.visiui.JsonFormEditor(onSave);
	
}

/** This indicates if this element displays data or something else (code) */
hax.app.visiui.FormDataMode.prototype.isData = true;

hax.app.visiui.FormDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
hax.app.visiui.FormDataMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	
	
	this.editor.showData(json,editOk);
}

hax.app.visiui.FormDataMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

hax.app.visiui.FormDataMode.prototype.onSave = function(data) {

	var table = this.component.getObject();
	hax.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}

