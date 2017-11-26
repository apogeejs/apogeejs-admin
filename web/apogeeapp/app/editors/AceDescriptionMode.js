
apogeeapp.app.AceDescriptionMode = function(componentDisplay) {
	apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceDescriptionMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceDescriptionMode.prototype.constructor = apogeeapp.app.AceDescriptionMode;

apogeeapp.app.AceDescriptionMode.prototype.createDisplay = function() {
    return new apogeeapp.app.TextAreaEditor(this);
    //return new apogeeapp.app.AceTextEditor(this,"ace/mode/text");
}

apogeeapp.app.AceDescriptionMode.prototype.getDisplayData = function() {
    return this.member.getDescription();
}

apogeeapp.app.AceDescriptionMode.prototype.getIsDataEditable = function() {
    return true;
}

//==============================
// internal
//==============================

apogeeapp.app.AceDescriptionMode.prototype.onSave = function(text) {
	
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = this.member;
    actionData.description = text;
	var actionResponse =  apogee.action.doAction(actionData,true);
	
	return true;
}
