
visicomp.app.visiui.FormDataMode = function(component) {
	this.component = component;

	var instance = this;
	var onSave = function(data) {
		instance.onSave(data);
	}
	
	this.editor = new visicomp.app.visiui.JsonFormEditor(onSave);
	
}

visicomp.app.visiui.FormDataMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
visicomp.app.visiui.FormDataMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	
	
	this.editor.showData(json,editOk);
}

visicomp.app.visiui.FormDataMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

visicomp.app.visiui.FormDataMode.prototype.onSave = function(data) {

	var table = this.component.getObject();
	visicomp.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}

