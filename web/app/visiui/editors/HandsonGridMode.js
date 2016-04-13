
visicomp.app.visiui.HandsonGridMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(data) {
		return instance.onSave(data);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new visicomp.app.visiui.HandsonGridEditor(component,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
visicomp.app.visiui.HandsonGridMode.prototype.isData = true;

visicomp.app.visiui.HandsonGridMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
visicomp.app.visiui.HandsonGridMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	this.editor.showData(json,editOk);
}

visicomp.app.visiui.HandsonGridMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

visicomp.app.visiui.HandsonGridMode.prototype.onSave = function(data) {
	var table = this.component.getObject();
	visicomp.core.updatemember.updateData(table,data);
//the response should depend on this result in some way? check the error dialogs
	
	return true;
}
visicomp.app.visiui.HandsonGridMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}

////////////////////////////////////////////////////////////////////////

