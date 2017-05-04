
haxapp.app.HandsonGridMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);
	this.setEditor(new haxapp.app.HandsonGridEditor(this));
	
}

haxapp.app.HandsonGridMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.HandsonGridMode.prototype.constructor = haxapp.app.HandsonGridMode;

haxapp.app.HandsonGridMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	

	this.editor.showData(json,this.getIsEditable());
}

//==============================
// internal
//==============================

haxapp.app.HandsonGridMode.prototype.onSave = function(data) {
	var table = this.componentDisplay.getObject();
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = table;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}


