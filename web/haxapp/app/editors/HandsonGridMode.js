
haxapp.app.HandsonGridMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.HandsonGridMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.HandsonGridMode.prototype.constructor = haxapp.app.HandsonGridMode;

haxapp.app.HandsonGridMode.prototype.createDisplay = function() {
    return new haxapp.app.HandsonGridEditor(this);
}

haxapp.app.HandsonGridMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

haxapp.app.HandsonGridMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

haxapp.app.HandsonGridMode.prototype.onSave = function(data) {
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}


