
hax.app.visiui.HandsonGridMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(data) {
		return instance.onSave(data);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new hax.app.visiui.HandsonGridEditor(component,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
hax.app.visiui.HandsonGridMode.prototype.isData = true;

hax.app.visiui.HandsonGridMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
hax.app.visiui.HandsonGridMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	this.editor.showData(json,editOk);
}

hax.app.visiui.HandsonGridMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

hax.app.visiui.HandsonGridMode.prototype.onSave = function(data) {
	var table = this.component.getObject();
	hax.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
hax.app.visiui.HandsonGridMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}

////////////////////////////////////////////////////////////////////////

