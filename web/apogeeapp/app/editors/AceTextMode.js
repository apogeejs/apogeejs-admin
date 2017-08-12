
apogeeapp.app.AceTextMode = function(componentDisplay) {
    apogeeapp.app.ViewMode.call(this,componentDisplay,apogeeapp.app.ViewMode.DISPLAY_DESTROY_FLAG_INACTIVE_AND_MINIMIZED);
}

apogeeapp.app.AceTextMode.prototype = Object.create(apogeeapp.app.ViewMode.prototype);
apogeeapp.app.AceTextMode.prototype.constructor = apogeeapp.app.AceTextMode;

apogeeapp.app.AceTextMode.prototype.createDisplay = function() {
    return new apogeeapp.app.AceTextEditor(this,"ace/mode/text");
}

apogeeapp.app.AceTextMode.prototype.getDisplayData = function() {
	var json = this.member.getData();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
    
    return textData;
}

apogeeapp.app.AceTextMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

apogeeapp.app.AceTextMode.prototype.onSave = function(text) {
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = text;
	var actionResponse =  apogee.action.doAction(actionData);
	
	return true;
}
