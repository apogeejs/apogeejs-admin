
haxapp.app.AceDescriptionMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceDescriptionMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDescriptionMode.prototype.constructor = haxapp.app.AceDescriptionMode;

haxapp.app.AceDescriptionMode.prototype.createDisplay = function() {
    return new haxapp.app.TextAreaEditor(this);
    //return new haxapp.app.AceTextEditor(this,"ace/mode/text");
}

haxapp.app.AceDescriptionMode.prototype.getDisplayData = function() {
    return this.member.getDescription();
}

haxapp.app.AceDescriptionMode.prototype.getIsDataEditable = function() {
    return true;
}

//==============================
// internal
//==============================

haxapp.app.AceDescriptionMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = this.member;
    actionData.description = text;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}
