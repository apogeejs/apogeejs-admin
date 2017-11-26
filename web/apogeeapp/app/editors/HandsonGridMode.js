
apogeeapp.app.HandsonGridMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.HandsonGridMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.HandsonGridMode.prototype.constructor = apogeeapp.app.HandsonGridMode;

apogeeapp.app.HandsonGridMode.prototype.createDisplay = function() {
    return new apogeeapp.app.HandsonGridEditor(this);
}

apogeeapp.app.HandsonGridMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

apogeeapp.app.HandsonGridMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.HandsonGridMode.prototype.onSave = function(data) {
    
	var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData,true);
	
	return true;
}


