
haxapp.app.FormDataMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);	
}

haxapp.app.FormDataMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.FormDataMode.prototype.constructor = haxapp.app.FormDataMode;

haxapp.app.FormDataMode.prototype.createDisplay = function() {
    return new haxapp.app.JsonFormEditor(this);
}

haxapp.app.FormDataMode.prototype.getDisplayData = function() {
	return this.member.getData();	
}

haxapp.app.FormDataMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

//==============================
// internal
//==============================

haxapp.app.FormDataMode.prototype.onSave = function(data) {
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = data;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}

