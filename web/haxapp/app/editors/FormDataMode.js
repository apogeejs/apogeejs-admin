
haxapp.app.FormDataMode = function(componentDisplay) {
	this.componentDisplay = componentDisplay;

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
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	
	
	this.editor.showData(json,editOk);
}

haxapp.app.FormDataMode.prototype.destroy = function() {
}

//==============================
// internal
//==============================

haxapp.app.FormDataMode.prototype.onSave = function(data) {

	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}

