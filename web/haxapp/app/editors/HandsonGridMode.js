
haxapp.app.HandsonGridMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay,true);
}

haxapp.app.HandsonGridMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.HandsonGridMode.prototype.constructor = haxapp.app.HandsonGridMode;

haxapp.app.HandsonGridMode.prototype.showData = function() {
		
	var json = this.member.getData();	

    if(!this.editor) {
        this.editor = new haxapp.app.HandsonGridEditor(this);
    }
	this.editor.showData(json,this.getDataIsEditable());
}

//==============================
// internal
//==============================

haxapp.app.HandsonGridMode.prototype.onSave = function(data) {
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(this.member.getWorkspace(),actionData);
	
	return true;
}


