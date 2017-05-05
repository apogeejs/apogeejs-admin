
haxapp.app.HandsonGridMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);
}

haxapp.app.HandsonGridMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.HandsonGridMode.prototype.constructor = haxapp.app.HandsonGridMode;

haxapp.app.HandsonGridMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getData();	

    if(!this.editor) {
        this.editor = new haxapp.app.HandsonGridEditor(this);
    }
	this.editor.showData(json,this.getDataIsEditable(table));
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


