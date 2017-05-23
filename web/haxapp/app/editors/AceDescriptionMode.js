
haxapp.app.AceDescriptionMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceDescriptionMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDescriptionMode.prototype.constructor = haxapp.app.AceDescriptionMode;

haxapp.app.AceDescriptionMode.prototype.showData = function() {
		
	var json = this.member.getDescription();	
	
	var textData;
	if((json === null)||(json === undefined)) {
		textData = "";
	}
	else {
		textData = json;
	}
	
    if(!this.editor) {
        this.editor =  new haxapp.app.TextAreaEditor(this);
        //this.editor =  new haxapp.app.AceTextEditor(componentDisplay,"ace/mode/text",onSave,onCancel);
    }
	this.editor.showData(textData,true);
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
	var actionResponse =  hax.action.doAction(this.member.getWorkspace(),actionData);
	
	return true;
}
