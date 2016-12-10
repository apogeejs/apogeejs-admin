
haxapp.app.HandsonGridMode = function(component) {
	this.component = component;
	
	this.editOk = false;
	
	var instance = this;
	var onSave = function(data) {
		return instance.onSave(data);
	}
	var onCancel = function() {
		return instance.onCancel();
	}
	
	this.editor = new haxapp.app.HandsonGridEditor(component,onSave,onCancel);
	
}

/** This indicates if this element displays data or something else (code) */
haxapp.app.HandsonGridMode.prototype.isData = true;

haxapp.app.HandsonGridMode.prototype.getElement = function() {
	return this.editor.getElement();
}
	
haxapp.app.HandsonGridMode.prototype.showData = function(editOk) {
		
	var table = this.component.getObject();
	var json = table.getData();	

	this.editOk = editOk;
	this.editor.showData(json,editOk);
}

haxapp.app.HandsonGridMode.prototype.destroy = function() {
	this.editor.destroy();
}

//==============================
// internal
//==============================

haxapp.app.HandsonGridMode.prototype.onSave = function(data) {
	var table = this.component.getObject();
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
haxapp.app.HandsonGridMode.prototype.onCancel = function() {
	//reload old data
	this.showData(this.editOk);
	
	return true;
}

////////////////////////////////////////////////////////////////////////

