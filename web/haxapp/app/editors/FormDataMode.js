
haxapp.app.FormDataMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);	
}

haxapp.app.FormDataMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.FormDataMode.prototype.constructor = haxapp.app.FormDataMode;

haxapp.app.FormDataMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	
	
    if(!this.editor) {
        this.editor = new haxapp.app.JsonFormEditor(this);
    }
	this.editor.showData(json,this.getDataIsEditable(table));
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

