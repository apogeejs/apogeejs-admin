
haxapp.app.AceDescriptionMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);
}

haxapp.app.AceDescriptionMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.AceDescriptionMode.prototype.constructor = haxapp.app.AceDescriptionMode;

haxapp.app.AceDescriptionMode.prototype.showData = function() {
		
	var table = this.componentDisplay.getObject();
	var json = table.getDescription();	
	
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
	
	var table = this.componentDisplay.getObject();
    
    var actionData = {};
    actionData.action = "updateDescription";
    actionData.member = table;
    actionData.description = text;
	var actionResponse =  hax.action.doAction(table.getWorkspace(),actionData);
	
	return true;
}
