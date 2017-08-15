
apogeeapp.app.FormDataMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);	
}

apogeeapp.app.FormDataMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.FormDataMode.prototype.constructor = apogeeapp.app.FormDataMode;

apogeeapp.app.FormDataMode.prototype.createDisplay = function() {
    return new apogeeapp.app.JsonFormEditor(this);
}

apogeeapp.app.FormDataMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

apogeeapp.app.FormDataMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

//==============================
// internal
//==============================

apogeeapp.app.FormDataMode.prototype.onSave = function(data) {
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}

