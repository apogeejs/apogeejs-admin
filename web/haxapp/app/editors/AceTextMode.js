
haxapp.app.AceTextMode = function(componentDisplay) {
    haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceTextMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceTextMode.prototype.constructor = haxapp.app.AceTextMode;

haxapp.app.AceTextMode.prototype.createDisplay = function() {
    return new haxapp.app.AceTextEditor(this,"ace/mode/text");
}

haxapp.app.AceTextMode.prototype.getDisplayData = function() {
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

haxapp.app.AceTextMode.prototype.getIsDataEditable = function() {
    //data is editable only if there is no code
    return !(this.member.hasCode());
}

haxapp.app.AceTextMode.prototype.onSave = function(text) {
	
	if((text === null)||(text === undefined)) {
		text = "";
	}
    
    var actionData = {};
    actionData.action = "updateData";
    actionData.member = this.member;
    actionData.data = text;
	var actionResponse =  hax.action.doAction(actionData);
	
	return true;
}
